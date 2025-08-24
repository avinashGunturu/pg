// Simple test to verify tenant edit functionality
// This can be run in the browser console to test the API endpoints

const testTenantEdit = async () => {
  console.log('🧪 Starting Tenant Edit Functionality Test...');
  
  try {
    // Test 1: Fetch tenant list to get an existing tenant ID
    console.log('📋 Test 1: Fetching tenant list...');
    const listResponse = await fetch('/api/tenant/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        mobile: '',
        email: '',
        tenantId: '',
        ownerId: '68a643b5430dd953da794950',
        propertyId: '',
        state: '',
        city: '',
        maritalStatus: ''
      })
    });
    
    const listData = await listResponse.json();
    console.log('✅ Tenant list response:', listData);
    
    if (!listData.data?.tenants?.length) {
      console.log('ℹ️ No tenants found for testing. Create a tenant first.');
      return;
    }
    
    const testTenant = listData.data.tenants[0];
    console.log('🎯 Test tenant:', testTenant);
    
    // Test 2: Test tenant update endpoint
    console.log('📝 Test 2: Testing tenant update...');
    const updateData = {
      ...testTenant,
      personalInfo: {
        ...testTenant.personalInfo,
        firstName: 'Updated First Name'
      },
      notes: 'Updated via test script at ' + new Date().toISOString()
    };
    
    const updateResponse = await fetch('/api/tenant/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: testTenant._id,
        updateData: updateData
      })
    });
    
    const updateResult = await updateResponse.json();
    console.log('✅ Update response:', updateResult);
    
    if (updateResult.code === 0 || updateResult.success) {
      console.log('🎉 Tenant edit functionality is working correctly!');
    } else {
      console.log('❌ Update failed:', updateResult.message);
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
  }
};

// Export for use in browser console
window.testTenantEdit = testTenantEdit;

console.log('🔧 Tenant edit test loaded. Run testTenantEdit() in console to test.');