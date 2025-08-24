// Comprehensive Room Details Prefilling Test for API Response Format
// Tests the exact API response format: {"floor": 2, "roomNumber": "202", "roomType": "TRIPLE"}

const testRoomDetailsPrefilling = () => {
  console.log('🧪 Testing Room Details Prefilling with API Format...');
  console.log('🎯 Target API Response:', {
    "floor": 2,
    "roomNumber": "202", 
    "roomType": "TRIPLE"
  });
  
  // Test the exact prefilling logic
  const simulateAPIResponse = (apiResponse) => {
    console.log('\n📥 Simulating API Response:', apiResponse);
    
    // Extract values with proper type conversion (as implemented)
    const apiFloor = apiResponse.floor; // Should be number: 2
    const apiRoomNumber = apiResponse.roomNumber; // Should be string: "202"
    const apiRoomType = apiResponse.roomType; // Should be string: "TRIPLE"
    
    console.log('📊 Extracted Values:', { apiFloor, apiRoomNumber, apiRoomType });
    
    // Process floor
    const processedFloor = Number(apiFloor);
    console.log(`🏢 Floor Processing: ${apiFloor} → ${processedFloor} (${typeof processedFloor})`);
    
    // Process room number
    const processedRoomNumber = String(apiRoomNumber);
    console.log(`🚪 Room Number Processing: ${apiRoomNumber} → "${processedRoomNumber}" (${typeof processedRoomNumber})`);
    
    // Process room type
    const processedRoomType = String(apiRoomType).toUpperCase();
    console.log(`🏷️ Room Type Processing: ${apiRoomType} → "${processedRoomType}" (${typeof processedRoomType})`);
    
    // Validate processing
    const isValid = (
      !isNaN(processedFloor) && 
      processedFloor > 0 &&
      processedRoomNumber.length > 0 &&
      processedRoomType.length > 0
    );
    
    console.log(`✅ Validation Result: ${isValid}`);
    
    return {
      floor: processedFloor,
      roomNumber: processedRoomNumber,
      roomType: processedRoomType,
      isValid
    };
  };
  
  // Test with exact API response
  const testAPI1 = simulateAPIResponse({
    "floor": 2,
    "roomNumber": "202",
    "roomType": "TRIPLE"
  });
  
  // Test with variations
  const testAPI2 = simulateAPIResponse({
    "floor": "2", // String floor
    "roomNumber": 202, // Number room number
    "roomType": "triple" // Lowercase room type
  });
  
  console.log('\n📊 Test Results Summary:');
  console.table([
    {
      Test: 'Exact API Format',
      Floor: testAPI1.floor,
      RoomNumber: testAPI1.roomNumber,
      RoomType: testAPI1.roomType,
      Valid: testAPI1.isValid
    },
    {
      Test: 'Mixed Types',
      Floor: testAPI2.floor,
      RoomNumber: testAPI2.roomNumber,
      RoomType: testAPI2.roomType,
      Valid: testAPI2.isValid
    }
  ]);
  
  return { testAPI1, testAPI2 };
};

const testRoomSelection = () => {
  console.log('\n🎯 Testing Room Selection Logic...');
  
  // Mock room data similar to what would be generated
  const mockRooms = {
    "2": [ // Floor 2
      {
        roomNo: "202",
        roomName: "Room 202",
        number: "202",
        sharingOption: "TRIPLE",
        type: "TRIPLE",
        noOfBeds: 3,
        occupied: false
      },
      {
        roomNo: "201",
        roomName: "Room 201", 
        number: "201",
        sharingOption: "DOUBLE",
        type: "DOUBLE",
        noOfBeds: 2,
        occupied: true
      }
    ]
  };
  
  // Test room matching with API response "202"
  const targetRoomNumber = "202";
  const floorRooms = mockRooms["2"];
  
  console.log('🏠 Mock Rooms on Floor 2:', floorRooms);
  console.log('🎯 Target Room Number:', targetRoomNumber);
  
  // Test the enhanced matching logic
  floorRooms.forEach((room, index) => {
    const roomIdentifiers = [
      String(room.roomNo || ''),
      String(room.roomName || ''),
      String(room.number || '')
    ];
    
    const isMatch = roomIdentifiers.some(identifier => 
      identifier === targetRoomNumber && identifier !== ''
    );
    
    console.log(`Room ${index + 1}:`, {
      identifiers: roomIdentifiers,
      matches: isMatch,
      roomType: room.sharingOption
    });
  });
  
  const matchingRoom = floorRooms.find(room => {
    const roomIdentifiers = [
      String(room.roomNo || ''),
      String(room.roomName || ''),
      String(room.number || '')
    ];
    return roomIdentifiers.includes(targetRoomNumber);
  });
  
  console.log('🎉 Matching Room Found:', matchingRoom);
  
  return matchingRoom;
};

const testCompleteFlow = () => {
  console.log('\n🔄 Testing Complete Prefilling Flow...');
  
  const apiResponse = {
    "floor": 2,
    "roomNumber": "202",
    "roomType": "TRIPLE"
  };
  
  console.log('1️⃣ API Response:', apiResponse);
  
  // Step 1: Process API response
  const processed = {
    floor: Number(apiResponse.floor),
    roomNumber: String(apiResponse.roomNumber),
    roomType: String(apiResponse.roomType).toUpperCase()
  };
  
  console.log('2️⃣ Processed Values:', processed);
  
  // Step 2: Simulate form setValue calls
  const formValues = {
    'roomDetails.floor': processed.floor,
    'roomDetails.roomNumber': processed.roomNumber,
    'roomDetails.roomType': processed.roomType
  };
  
  console.log('3️⃣ Form Values Set:', formValues);
  
  // Step 3: Validate room selection
  const roomFound = testRoomSelection();
  
  console.log('4️⃣ Room Selection:', roomFound ? 'SUCCESS' : 'NOT FOUND');
  
  // Step 4: Final validation
  const isComplete = (
    processed.floor === 2 &&
    processed.roomNumber === "202" &&
    processed.roomType === "TRIPLE" &&
    roomFound
  );
  
  console.log(`🎉 Complete Flow Result: ${isComplete ? 'SUCCESS' : 'FAILED'}`);
  
  return isComplete;
};

// Export for browser console use
if (typeof window !== 'undefined') {
  window.testRoomDetailsPrefilling = testRoomDetailsPrefilling;
  window.testRoomSelection = testRoomSelection;
  window.testCompleteFlow = testCompleteFlow;
  
  console.log('🔧 Room Details Prefilling Tests Loaded!');
  console.log('Available functions:');
  console.log('- testRoomDetailsPrefilling() - Test API response processing');
  console.log('- testRoomSelection() - Test room matching logic');
  console.log('- testCompleteFlow() - Test complete prefilling flow');
}

export { testRoomDetailsPrefilling, testRoomSelection, testCompleteFlow };