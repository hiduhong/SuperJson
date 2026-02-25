import { useState, useMemo } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { SplitPane } from "./components/ui/SplitPane";
import { ConfirmDialog } from "./components/ui/ConfirmDialog";
import { JsonEditor } from "./features/json-parser/JsonEditor";
import { JsonViewer } from "./features/json-parser/JsonViewer";
import { extractJsonWithRanges } from "./utils/jsonExtractor";
import type { ExtractedJsonSegment, JsonValue } from "./utils/jsonExtractor";
import { HeaderBar } from "./components/layout/HeaderBar.tsx";
import { useHistory } from "./hooks/useHistory";
import { useSampleLoader } from "./hooks/useSampleLoader";


function App() {
  const { 
    state: input, 
    set: setInput, 
    undo, 
    redo
  } = useHistory<string>("");
  
  const [isSmartExtract, setIsSmartExtract] = useState<boolean>(true);
  const { isConfirmOpen, handleLoadSample, confirmLoadSample, cancelLoadSample } = useSampleLoader(
    input,
    setInput
  );

  const { json, error, segments, sourceText } = useMemo(() => {
    if (!input.trim()) {
      return { json: [], error: null, segments: [] as ExtractedJsonSegment[], sourceText: "" };
    }

    try {
      let parsed: JsonValue[];
      if (isSmartExtract) {
        const result = extractJsonWithRanges(input);
        return { json: result.values, error: null, segments: result.segments, sourceText: input };
      } else {
        const result = JSON.parse(input);
        parsed = [result];
      }
      return { json: parsed, error: null, segments: [] as ExtractedJsonSegment[], sourceText: "" };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { json: [], error: message, segments: [] as ExtractedJsonSegment[], sourceText: "" };
    }
  }, [input, isSmartExtract]);

  const handleFormat = () => {
    if (json.length > 0) {
      // Format logic:
      // If single item, format it directly.
      // If multiple items, format them as a JSON array.
      if (json.length === 1) {
         setInput(JSON.stringify(json[0], null, 2), true);
      } else {
         setInput(JSON.stringify(json, null, 2), true);
      }
    }
  };

  return (
    <MainLayout header={<HeaderBar />}>
      <SplitPane
        direction="horizontal"
        sizes={[40, 60]}
        minSize={300}
        gutterSize={8}
        snapOffset={30}
        className="flex-1"
      >
        <JsonEditor
          value={input}
          onChange={(val) => setInput(val)}
          onFormat={handleFormat}
          isSmartExtract={isSmartExtract}
          onToggleSmartExtract={() => setIsSmartExtract(!isSmartExtract)}
          onLoadSample={handleLoadSample}
          onUndo={undo}
          onRedo={redo}
        />
        <JsonViewer data={json} error={error} sourceText={sourceText} segments={segments} />
      </SplitPane>
      <ConfirmDialog
        open={isConfirmOpen}
        title="加载示例"
        description="输入框已有内容，是否清空并加载示例？"
        cancelText="取消"
        confirmText="清空并加载"
        onCancel={cancelLoadSample}
        onConfirm={confirmLoadSample}
      />
    </MainLayout>
  );
}

export default App;
