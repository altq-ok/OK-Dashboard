import os
import json
from taskiq_fs import FSBroker

# Dicretories to share status etc.
SHARED_DIR = "~/Documents/Dev/TypeScript/shared/TaskQueue"
STATUS_DIR = "~/Documents/Dev/TypeScript/shared/Status"

# Set SHARED_DIR as a broker
broker = FSBroker(SHARED_DIR)

@broker.task
async def run_computation(fund_id: str, task_id: str):
    status_file = os.path.join(STATUS_DIR, f"{fund_id}.json")
    
    try:
        # Set status as running
        with open(status_file, "w") as f:
            json.dump({"status": "running", "worker": os.getenv("COMPUTERNAME"), "start_at": str(datetime.now())}, f)

        # Get results
        fund = await FundFactory.get_fund(fund_id)
        result_df = await fund.compute()
        
        # Save results in parquet
        result_df.to_parquet(f"//SharedServer/Dashboard/Cache/{fund_id}.parquet")

        # Set stutus as complete
        with open(status_file, "w") as f:
            json.dump({"status": "done", "updated_at": str(datetime.now())}, f)

    except Exception as e:
        # When failed
        with open(status_file, "w") as f:
            json.dump({"status": "failed", "error": str(e)}, f)
