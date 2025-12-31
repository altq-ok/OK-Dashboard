class PortfolioDataManager:
    def __init__(self, shared_dir: str):
        # Import libraries here to avoid heavy imports in FastAPI's process
        import pathlib

        import pandas as pd

        self.pd = pd  # For testing
        self.shared_dir = pathlib.Path(shared_dir)

    def run(self, params: dict) -> str:
        """
        Executes the actual task.
        Returns the path to the generated Parquet file.
        """

        df = self.pd.DataFrame([1, 2, 3])
        path = self.shared_dir / "test.csv"
        df.to_csv(path)

        return str(path)
