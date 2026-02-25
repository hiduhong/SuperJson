import { useState, useMemo } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { SplitPane } from "./components/ui/SplitPane";
import { JsonEditor } from "./features/json-parser/JsonEditor";
import { JsonViewer } from "./features/json-parser/JsonViewer";
import { extractJsonWithRanges } from "./utils/jsonExtractor";
import type { ExtractedJsonSegment, JsonValue } from "./utils/jsonExtractor";
import { HeaderBar } from "./components/layout/HeaderBar.tsx";
import { useHistory } from "./hooks/useHistory";

const SAMPLE_DATA = JSON.stringify({
  "id": "evt_1M5GqH2eZvKYlo2C0",
  "object": "event",
  "api_version": "2020-08-27",
  "created": 1669839353,
  "data": {
    "object": {
      "id": "ch_3M5GqH2eZvKYlo2C1g9",
      "object": "charge",
      "amount": 2000,
      "currency": "usd",
      "description": "Subscription to Premium Plan",
      "status": "succeeded"
    }
  },
  "livemode": false,
  "type": "charge.succeeded"
}, null, 2);

// 模拟脏日志数据
const DIRTY_SAMPLE = `2023-10-27 10:30:01 INFO [ReqId:12345] Incoming request payload: "{\\"user_id\\": 1001, \\"meta\\": \\"{\\\\\\"ip\\\\\\": \\\\\\"127.0.0.1\\\\\\", \\\\\\"device\\\\\\": \\\\\\"ios\\\\\\"}\\", \\"actions\\": [\\"login\\", \\"view_profile\\"]}" - processed in 20ms`;

function App() {
  const { 
    state: input, 
    set: setInput, 
    undo, 
    redo
  } = useHistory<string>("");
  
  const [isSmartExtract, setIsSmartExtract] = useState<boolean>(true);

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



  const handleLoadSample = () => {
    // Force snapshot for loading sample
    setInput(SAMPLE_DATA, true);
  };
  
  const handleLoadDirtySample = () => {
    // Force snapshot for loading sample
    setInput(DIRTY_SAMPLE, true);
  };

  return (
    <MainLayout
      header={
        <HeaderBar onLoadDirtySample={handleLoadDirtySample} />
      }
    >
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
    </MainLayout>
  );
}

export default App;
