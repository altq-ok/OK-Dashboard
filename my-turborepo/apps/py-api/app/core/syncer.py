import logging
import os
import shutil
import threading
import time

logger = logging.getLogger(__name__)


class FileSyncer(threading.Thread):
    """
    Intelligent background syncer for Windows Network Shares.
    Ensures sequential execution and minimal I/O by checking modification times.
    """

    def __init__(self, shared_root: str, local_root: str, interval: int = 10):
        super().__init__(daemon=True)
        self.shared_root = shared_root
        self.local_root = local_root
        self.interval = interval
        self._stop_event = threading.Event()

    def stop(self):
        self._stop_event.set()

    def run(self):
        logging.info(f"Syncer: Monitoring started. Shared: {self.shared_root} -> Local: {self.local_root}")

        while not self._stop_event.is_set():
            start_time = time.time()

            try:
                self.sync_directory("status")
                self.sync_directory("snapshots")
            except Exception as e:
                logging.error(f"Syncer: Error during sync: {e}")

            elapsed = time.time() - start_time
            if elapsed > 1.0:
                logging.debug(f"Syncer: Sync took {elapsed:.2f} seconds.")

            # This sleep is only triggered once copy is completed
            time.sleep(self.interval)

    def sync_directory(self, sub_dir: str):
        shared_base = os.path.join(self.shared_root, sub_dir)
        local_base = os.path.join(self.local_root, sub_dir)

        if not os.path.exists(shared_base):
            return

        for root, _, files in os.walk(shared_base):
            rel_path = os.path.relpath(root, shared_base)
            dest_dir = os.path.abspath(os.path.join(local_base, rel_path))

            # Make directories in local
            if not os.path.exists(dest_dir):
                os.makedirs(dest_dir, exist_ok=True)

            for file in files:
                shared_file = os.path.join(root, file)
                local_file = os.path.join(dest_dir, file)

                try:
                    # Check update:
                    # 1. Doesn't exist in local
                    # 2. Update time in shared is newer than local (> 1 sec)
                    if not os.path.exists(local_file) or (
                        os.path.getmtime(shared_file) - os.path.getmtime(local_file) > 1.0
                    ):
                        logging.info(f"Syncer: Updating {sub_dir}/{rel_path}/{file}")
                        # Use copy2() to keep metadata (mtime) for update time comparison
                        shutil.copy2(shared_file, local_file)
                except (IOError, OSError) as e:
                    # If file is locked etc., skip and retry on next loop
                    logging.warning(f"Syncer: Could not copy {file}. It might be in use. {e}")
