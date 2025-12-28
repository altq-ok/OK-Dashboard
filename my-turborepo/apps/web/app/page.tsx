import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Page() {
  return (
    <div className="h-screen w-screen p-4">
      <ResizablePanelGroup
        orientation="vertical"
        // className="min-h-[200px] max-w-md rounded-lg border md:min-w-[450px]"
        className="min-h-[200px] rounded-lg border md:min-w-[450px]"
      >
        <ResizablePanel defaultSize={15}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Header</span>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={85}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Content</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
