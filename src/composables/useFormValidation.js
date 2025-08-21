// composables/useFormValidation.js
import { ref } from "vue";

export function useFormValidation() {
  const senderDocNo = ref("");
  const jsonName = ref("");
  const sourceSystem = ref("");

  const docNoError = ref("");
  const jsonNameError = ref("");
  const sourceSystemError = ref("");

  const validateDocNo = () => {
    if (senderDocNo.value.length > 12) {
      docNoError.value = "Document Number cannot exceed 12 characters";
      senderDocNo.value = senderDocNo.value.slice(0, 12);
      return false;
    }
    if (!senderDocNo.value) {
      docNoError.value = "Document Number is required";
      return false;
    }
    docNoError.value = "";
    return true;
  };

  const validateJsonName = () => {
    if (!jsonName.value) {
      jsonNameError.value = "JSON Name is required";
      return false;
    }
    jsonNameError.value = "";
    return true;
  };

  const validateSourceSystem = () => {
    if (!sourceSystem.value) {
      sourceSystemError.value = "Source System is required";
      return false;
    }
    sourceSystemError.value = "";
    return true;
  };

  const validateAll = () => {
    const isDocNoValid = validateDocNo();
    const isJsonNameValid = validateJsonName();
    const isSourceSystemValid = validateSourceSystem();

    return isDocNoValid && isJsonNameValid && isSourceSystemValid;
  };

  const handleDocNoInput = () => {
    if (senderDocNo.value.length > 12) {
      senderDocNo.value = senderDocNo.value.slice(0, 12);
    }
    validateDocNo();
  };

  const resetValidation = () => {
    docNoError.value = "";
    jsonNameError.value = "";
    sourceSystemError.value = "";
  };

  return {
    // State
    senderDocNo,
    jsonName,
    sourceSystem,
    docNoError,
    jsonNameError,
    sourceSystemError,

    // Methods
    validateDocNo,
    validateJsonName,
    validateSourceSystem,
    validateAll,
    handleDocNoInput,
    resetValidation,
  };
}
