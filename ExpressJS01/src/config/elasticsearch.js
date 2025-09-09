let Client;
try {
  ({ Client } = require('@elastic/elasticsearch'));
} catch (error) {
  console.log('⚠️  @elastic/elasticsearch not found, using fallback mode');
  return module.exports = require('./elasticsearch-fallback');
}

// Elasticsearch configuration
const elasticsearchConfig = {
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_AUTH ? {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'password'
  } : undefined,
  requestTimeout: 60000,
  pingTimeout: 3000,
  maxRetries: 3
};

// Create Elasticsearch client
const client = new Client(elasticsearchConfig);

// Test connection
const testConnection = async () => {
  try {
    const response = await client.ping();
    console.log('✅ Elasticsearch connection successful');
    return true;
  } catch (error) {
    console.log('❌ Elasticsearch connection failed:', error.message);
    return false;
  }
};

// Create products index with mapping
const createProductsIndex = async () => {
  const indexName = 'products';
  
  try {
    // Check if index exists
    const exists = await client.indices.exists({ index: indexName });
    
    if (!exists) {
      await client.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              name: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: {
                    type: 'keyword'
                  },
                  suggest: {
                    type: 'completion'
                  }
                }
              },
              description: {
                type: 'text',
                analyzer: 'standard'
              },
              price: {
                type: 'double'
              },
              originalPrice: {
                type: 'double'
              },
              discountPercentage: {
                type: 'double'
              },
              category: {
                type: 'object',
                properties: {
                  _id: { type: 'keyword' },
                  name: { 
                    type: 'text',
                    fields: {
                      keyword: { type: 'keyword' }
                    }
                  },
                  slug: { type: 'keyword' }
                }
              },
              images: {
                type: 'keyword'
              },
              stock: {
                type: 'integer'
              },
              slug: {
                type: 'keyword'
              },
              isActive: {
                type: 'boolean'
              },
              featured: {
                type: 'boolean'
              },
              ratings: {
                type: 'object',
                properties: {
                  average: { type: 'double' },
                  count: { type: 'integer' }
                }
              },
              tags: {
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              views: {
                type: 'integer'
              },
              sales: {
                type: 'integer'
              },
              createdAt: {
                type: 'date'
              },
              updatedAt: {
                type: 'date'
              }
            }
          },
          settings: {
            analysis: {
              analyzer: {
                product_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding']
                }
              }
            }
          }
        }
      });
      console.log(`✅ Created index: ${indexName}`);
    } else {
      console.log(`ℹ️  Index ${indexName} already exists`);
    }
  } catch (error) {
    console.error('❌ Error creating products index:', error);
    throw error;
  }
};

module.exports = {
  client,
  testConnection,
  createProductsIndex
};