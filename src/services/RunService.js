export const saveRun = async (runData) => {
  // In a real app, you would send this data to your backend
  console.log('Saving run data:', runData);
  // Simulate an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};
