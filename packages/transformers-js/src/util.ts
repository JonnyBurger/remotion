
export async function hasWebGPU() {
  // @ts-expect-error
  if (!navigator.gpu) {
    return false;
  }

  try {
    // @ts-expect-error
    const adapter = await navigator.gpu.requestAdapter();
    return Boolean(adapter);
  } catch (e) {
    return false;
  }
}