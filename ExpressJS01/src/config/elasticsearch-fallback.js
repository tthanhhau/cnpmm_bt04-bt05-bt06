// Fallback Elasticsearch configuration when @elastic/elasticsearch is not available

const mockClient = {
  ping: async () => ({ body: { status: 'ok' } }),
  indices: {
    exists: async () => false,
    create: async () => ({ body: { acknowledged: true } })
  },
  index: async () => ({ body: { _id: 'mock', result: 'created' } }),
  delete: async () => ({ body: { _id: 'mock', result: 'deleted' } }),
  bulk: async () => ({ body: { errors: false, items: [] } }),
  search: async (params) => {
    console.log('⚠️  Using fallback search - Elasticsearch not available');
    return {
      hits: {
        hits: [],
        total: { value: 0 }
      },
      suggest: {
        product_suggest: [{ options: [] }]
      },
      aggregations: {
        categories: { buckets: [] },
        price_ranges: { buckets: [] },
        has_discount: { doc_count: 0 },
        rating_ranges: { buckets: [] }
      }
    };
  }
};

// Test connection (always fails for fallback)
const testConnection = async () => {
  console.log('⚠️  Elasticsearch client not available - using fallback mode');
  return false;
};

// Create products index (mock)
const createProductsIndex = async () => {
  console.log('ℹ️  Skipping index creation - Elasticsearch not available');
};

module.exports = {
  client: mockClient,
  testConnection,
  createProductsIndex
};