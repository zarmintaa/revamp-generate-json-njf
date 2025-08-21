// composables/useJsonTemplate.js
import { ref, computed } from "vue";

export function useJsonTemplate() {
  const isPreviewJsonTemplate = ref(false);
  const copyStatus = ref("");

  // Generic template generator - bisa di-override untuk template yang berbeda
  const generateTemplate = (config, fileData = null) => {
    const { senderDocNo, jsonName, sourceSystem } = config;

    let msgContent = [];
    if (fileData?.value) {
      msgContent = fileData.value.data.map((record) =>
        JSON.stringify({ data: { ...record } }),
      );
    }

    return {
      data: [
        {
          fastSeqNo: "1",
          msgContent,
          jsonName,
          sourceSystem,
          senderDocNo,
        },
      ],
    };
  };

  const downloadJson = (templateData, fileType = "EXCEL") => {
    if (!templateData) {
      throw new Error("No template data available for download");
    }

    const blob = new Blob([JSON.stringify(templateData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export_${new Date().toISOString()}_${fileType}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (templateData) => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(templateData, null, 2),
      );
      copyStatus.value = "Copied!";
      setTimeout(() => {
        copyStatus.value = "";
      }, 2000);
    } catch (err) {
      copyStatus.value = "Failed to copy";
      setTimeout(() => {
        copyStatus.value = "";
      }, 2000);
    }
  };

  const handlePreviewJsonTemplate = () => {
    isPreviewJsonTemplate.value = !isPreviewJsonTemplate.value;
  };

  return {
    // State
    isPreviewJsonTemplate,
    copyStatus,

    // Methods
    generateTemplate,
    downloadJson,
    copyToClipboard,
    handlePreviewJsonTemplate,
  };
}
