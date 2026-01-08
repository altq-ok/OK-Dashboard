class DataManager:
    # ... (initなどはそのまま)

    def _get_merged_files(self, data_type: str, target_id: str) -> List[str]:
        """[内部用ヘルパー] 2つのフォルダからファイル名の和集合を取得してソート"""
        files = set()
        paths = [
            os.path.join(self.local_root, "snapshots", data_type, target_id),
            os.path.join(self.local_root, "snapshots", data_type, "ALL"),
        ]
        for p in paths:
            if os.path.exists(p):
                files.update([f for f in os.listdir(p) if f.endswith(".parquet")])
        return sorted(list(files), reverse=True)

    def get_snapshots(self, data_type: str, target_id: str) -> List[str]:
        """修正：個別とALLの履歴を合体させて返す"""
        if target_id == "ALL":
            # ALLの場合は今まで通りALLフォルダのみ
            path = os.path.join(self.local_root, "snapshots", data_type, "ALL")
            if not os.path.exists(path):
                return []
            return sorted([f for f in os.listdir(path) if f.endswith(".parquet")], reverse=True)

        return self._get_merged_files(data_type, target_id)

    def load_parquet(self, data_type: str, target_id: str, filename: str) -> pd.DataFrame:
        """修正：ファイルがどちらのフォルダにあるか自動判定してロード"""
        # 1. まず個別フォルダを探す
        specific_path = os.path.join(self.local_root, "snapshots", data_type, target_id, filename)
        if os.path.exists(specific_path):
            return pd.read_parquet(specific_path, engine="pyarrow")

        # 2. なければ ALL フォルダを探す
        all_path = os.path.join(self.local_root, "snapshots", data_type, "ALL", filename)
        if os.path.exists(all_path):
            df = pd.read_parquet(all_path, engine="pyarrow")
            # ALLファイルから自分のIDだけを抽出（★重要）
            # カラム名は 'target_id' または 'account' など、保存時に合わせる
            if target_id != "ALL":
                df = df[df["target_id"] == target_id]
            return df

        raise FileNotFoundError(f"Snapshot {filename} not found in specific or ALL folders.")

    def get_latest_data(self, data_type: str, target_id: str) -> List[Dict[str, Any]]:
        """修正：個別とALL、より新しいファイル名を採用してロード"""
        files = self.get_snapshots(data_type, target_id)
        if not files:
            return []

        latest_filename = files[0]  # ソート済みの先頭
        df = self.load_parquet(data_type, target_id, latest_filename)
        return df.to_dict(orient="records")
