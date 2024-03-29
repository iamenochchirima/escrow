import React, { useState, ChangeEvent } from "react";
import { useAuth } from "../components/Context";
import { Asset, AssetMetadata } from "../declarations/hodl_nft/hodl_nft.did";

// Extend the React HTML attributes
declare module "react" {
  interface InputHTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

interface IFileProcessorProps {}

const Upload: React.FC<IFileProcessorProps> = () => {
  const { nftActor} = useAuth();

  const [files, setFiles] = useState<File[] | null>(null);
  const [jsonData, setJsonData] = useState<any[] | null>(null);

  const handleFolderUpload = (event: ChangeEvent<HTMLInputElement>) => {
    let folderFiles: File[] = [];
    let items = event.target.files;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        folderFiles.push(items[i]);
      }
    }

    setFiles(folderFiles);
  };

  const handleJsonUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        setJsonData(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Error reading JSON file:", error);
        setJsonData([]);
      }
    }
  };

  // const processJsonData = () => {
  //   if (Array.isArray(jsonData)) {
  //     jsonData.forEach((item, index) => {
  //       console.log(`Processing JSON item ${index}:`, item);
  //       // Add your JSON processing logic here
  //     });
  //   } else {
  //     console.log("No valid JSON data to process");
  //   }
  // };

  // const processFiles = () => {
  //   files.forEach((file) => {
  //     console.log("Processing file:", file.name);
  //   });
  // };

  const handleUpload = async () => {
    let assetIndex = 0;
    console.log("Uploading file")
    try {
      if (files && jsonData && nftActor) {
        for (const file of files) {
          const fileBytes = [...new Uint8Array(await file.arrayBuffer())];
          const fileMetadata = jsonData.find((item) => item.name === file.name);
          let _file = {
            ctype: "image/png",
            data: [fileBytes],
          };
          let asset: Asset = {
            name: `HODL-${assetIndex}`,
            thumbnail: [],
            payload: _file,
          };
          let nat = await nftActor.addAsset(asset);
          console.log("Uploaded asset. Adding metadata", nat)
          console.log("fileMetadata", fileMetadata)
          let _metadata: AssetMetadata = {
            id: Number(nat),
            assetIndex: Number(nat),
            name: fileMetadata.name,
            color: fileMetadata.color,
            glasses: fileMetadata.glasses,
            background: fileMetadata.background,
            outfit: fileMetadata.outfit,
            accessory: fileMetadata.accessory,
            expression: fileMetadata.expression,
          };
          await nftActor.addAssetMetadata(_metadata);
          console.log("Uploaded metadata")
          assetIndex++;
        }
      } else {
        console.log("No files or json data to upload")
        console.log(files)
        console.log(jsonData)
        console.log(nftActor)
      }
    } catch (error) {
      console.log("Error uploading file", error)
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-8 border border-gray-200 rounded-lg shadow">
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Image Folder
          </label>
          <input
            type="file"
            webkitdirectory=""
            directory=""
            onChange={handleFolderUpload}
            multiple
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload JSON File
          </label>
          <input
            type="file"
            accept="application/json"
            onChange={handleJsonUpload}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={handleUpload}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Upload
          </button>
        </div>
      </form>
    </div>
  );
};

export default Upload;
