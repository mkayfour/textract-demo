import React, { useState } from "react";

import {
  DetectDocumentTextCommand,
  TextractClient,
} from "@aws-sdk/client-textract";

import { Buffer } from "buffer";

globalThis.Buffer = Buffer;

import "./App.css";

function App() {
  const [src, setSrc] = useState("");
  const [data, setData] = useState([]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.onload = function (upload: ProgressEvent<FileReader>) {
      setSrc(upload?.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onRunOCR = async () => {
    const client = new TextractClient({
      region: "YOUR_AWS_REGION",
      credentials: {
        accessKeyId: "YOUR_AWS_ACCESS_KEY_ID",
        secretAccessKey: "YOUR_AWS_SECRET_ACCESS_KEY",
      },
    });

    // convert image to byte Uint8Array base 64
    const blob = Buffer.from(src.split(",")[1], "base64");

    const params = {
      Document: {
        Bytes: blob,
      },
      FeatureTypes: ["TABLES", "FORMS"],
    };

    const command = new DetectDocumentTextCommand(params);
    try {
      const data = await client.send(command);
      // process data
      if (data?.Blocks) {
        setData(data.Blocks as []);
      }
    } catch (error) {
      console.log("err", error);
      // error handling
    }
  };

  return (
    <div className="App">
      <div>
        <input
          className="inputfile"
          id="file"
          type="file"
          name="file"
          onChange={onSelectFile}
        />
      </div>
      <div>
        <button onClick={onRunOCR} style={{ margin: "10px" }}>
          Run OCR
        </button>

        <div style={{ border: "1px" }}>
          {data?.map(
            (
              item: {
                Text: string;
              },
              index
            ) => {
              return (
                <span key={index} style={{ margin: "2px", padding: "2px" }}>
                  {item.Text}
                </span>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
