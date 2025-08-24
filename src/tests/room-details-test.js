// Room Details Prefilling Test
// Test function to validate room details prefilling functionality

const testRoomDetailsPrefilling = () => {
  console.log('🧪 Testing Room Details Prefilling...');
  
  // The exact room details format provided by user
  const testRoomDetails = {
    "floor": 2,
    "roomNumber": "202", 
    "roomType": "TRIPLE"
  };
  
  console.log('📋 Test Data:', testRoomDetails);
  
  // Test different data type conversions that might occur
  const testCases = [
    {
      name: 'Number floor, String room number, String room type',
      data: { floor: 2, roomNumber: "202", roomType: "TRIPLE" }
    },
    {
      name: 'String floor, String room number, String room type', 
      data: { floor: "2", roomNumber: "202", roomType: "TRIPLE" }
    },
    {
      name: 'Number floor, Number room number, String room type',
      data: { floor: 2, roomNumber: 202, roomType: "TRIPLE" }
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n🔬 Test Case ${index + 1}: ${testCase.name}`);
    console.log('Input:', testCase.data);
    
    // Simulate the conversion logic used in the form
    const processedData = {
      floor: Number(testCase.data.floor),
      roomNumber: String(testCase.data.roomNumber),
      roomType: String(testCase.data.roomType)
    };
    
    console.log('Processed:', processedData);
    
    // Validate the processed data
    const isValid = (
      typeof processedData.floor === 'number' &&
      typeof processedData.roomNumber === 'string' &&
      typeof processedData.roomType === 'string' &&
      processedData.floor > 0 &&
      processedData.roomNumber.length > 0 &&
      processedData.roomType.length > 0
    );
    
    console.log(`✅ Valid: ${isValid}`);
  });
  
  // Test room selection matching logic
  console.log('\n🎯 Testing Room Selection Matching...');
  
  const mockRooms = [
    { roomNo: "202", roomName: "Room 202", number: "202", sharingOption: "TRIPLE", type: "TRIPLE" },
    { roomNo: 202, roomName: "202", number: 202, sharingOption: "TRIPLE", type: "TRIPLE" },
    { roomNo: "Room202", roomName: "202", number: "202", sharingOption: "TRIPLE", type: "TRIPLE" }
  ];
  
  const targetRoomNumber = "202";
  
  mockRooms.forEach((room, index) => {
    const matches = (
      targetRoomNumber === room.roomNo ||
      targetRoomNumber === room.roomName ||
      targetRoomNumber === room.number ||
      String(targetRoomNumber) === String(room.roomNo) ||
      String(targetRoomNumber) === String(room.roomName) ||
      String(targetRoomNumber) === String(room.number)
    );
    
    console.log(`Room ${index + 1}:`, room);
    console.log(`Matches: ${matches}`);
  });
  
  console.log('\n🎉 Room Details Prefilling Test Complete!');
};

// Test room type validation
const testRoomTypeValidation = () => {
  console.log('\n🔍 Testing Room Type Validation...');
  
  const validRoomTypes = ['SINGLE', 'DOUBLE', 'TRIPLE', 'FOURSHARING', 'FIVESHARING', 'SIXSHARING', 'OTHER'];
  const testRoomType = 'TRIPLE';
  
  const isValidRoomType = validRoomTypes.includes(testRoomType);
  console.log(`Room Type "${testRoomType}" is valid: ${isValidRoomType}`);
  
  // Test case variations
  const roomTypeVariations = ['triple', 'Triple', 'TRIPLE', 'TriPle'];
  roomTypeVariations.forEach(variation => {
    const normalized = variation.toUpperCase();
    const isValid = validRoomTypes.includes(normalized);
    console.log(`"${variation}" → "${normalized}" → Valid: ${isValid}`);
  });
};

// Export for browser console use
if (typeof window !== 'undefined') {
  window.testRoomDetailsPrefilling = testRoomDetailsPrefilling;
  window.testRoomTypeValidation = testRoomTypeValidation;
  
  console.log('🔧 Room prefilling tests loaded!');
  console.log('Run testRoomDetailsPrefilling() to test room details');
  console.log('Run testRoomTypeValidation() to test room types');
}

export { testRoomDetailsPrefilling, testRoomTypeValidation };