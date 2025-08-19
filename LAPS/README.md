# LAPS (Laptop Advisory and Processing System)

A comprehensive Node.js/TypeScript application that provides intelligent laptop recommendations and manual processing capabilities using AI-powered search and analysis.

## 🚀 Features

- **Laptop Management**: Complete CRUD operations for laptop inventory
- **AI-Powered Q&A**: Ask questions about specific laptop manuals using RAG (Retrieval-Augmented Generation)
- **PDF Manual Processing**: Automatic text extraction, and vectorization
- **Semantic Search**: Find relevant information from laptop manuals using vector similarity
- **Background Job Processing**: Asynchronous file processing with Redis queues
- **User Authentication**: JWT-based authentication system
- **Advanced Filtering**: Sort, filter, and paginate laptop listings

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js/TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Vector Database**: Pinecone for embeddings storage
- **AI**: Google Gemini API for embeddings and text generation, LangChain for AI orchestration
- **Job Queue**: BullMQ with Redis
- **Authentication**: JWT tokens
- **File Processing**: Multer for uploads, pdf-parse for text extraction

## 📁 Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── laptop.controller.ts
│   └── user.controller.ts
├── models/              # Database schemas
│   ├── laptop.model.ts
│   └── user.model.ts
├── routes/              # API route definitions
│   ├── laptop.routes.ts
│   ├── user.routes.ts
│   └── index.router.ts
├── workers/             # Background job processors
│   ├── manualFileProcessingWorker.ts
│   └── manualFileDeletionWorker.ts
├── queues/              # Job queue definitions
│   ├── manualFileProcessingQueue.ts
│   └── manualFileDeletionQueue.ts
├── utils/               # Utility classes and helpers
│   ├── aiClient.ts      # Google Gemini integration
│   ├── pineconeClient.ts # Vector database client
│   ├── ragSystem.ts     # RAG implementation
│   ├── embeddingClient.ts # Google Gemini embeddings wrapper
│   ├── apiFeatures.ts   # Query helpers
│   └── ...
├── middlewares/         # Express middlewares
├── helpers/             # Data processing scripts
└── uploads/             # File storage
    └── manuals/laptops/
```

## 🔧 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd LAPS
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**
   Create a `.env` file with the following variables:

```env
# Database
NODE_ENV=<production || development>
PORT=<port you want project to run on>
DB=you_db_url
EMBEDDING_DIMENSION=3072

# AI Services
GEMINI_API_KEY=your_gemini_api_key
EMBEDDING_MODEL=<gemini embedding model ex: emini-embedding-001>
LLM_MODEL=<gemini model ex: gemini-1.5-flash>

# Vector Database
PINECONE_API_KEY=your_pinecone_api_key
LAPTOPS_MANUAL_FILES_INDEX_NAME=<name of the index on pinecone ex: laptop-manuals>
LAPTOPS_MANUAL_TOP_K=<number of retrived docs based on similarity >

# Redis Queue
REDIS_HOST=<host>
REDIS_PORT=< redis port>

# File Storage
MANUAL_FILES_PATH=uploads/manuals

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

4. **Start Redis Server**

```bash
redis-server
```

5. **Run the application**

```bash
# Development
npm run dev

# Production
npm start
```

## 📋 API Endpoints

### Laptop Management

- `GET /api/v1/laptop` - Get all laptops (with filtering, sorting, pagination, limiting returned fields)
- `GET /api/v1/laptop/:id` - Get laptop by ID
- `POST /api/v1/laptop` - Create new laptop (with manual upload)
- `PATCH /api/v1/laptop/:id` - Update laptop (with manual replacement)
- `DELETE /api/v1/laptop/:id` - Delete laptop
- `GET /api/v1/laptop/stats` - Get laptop statistics grouped by brand (authentication required)

### AI-Powered Features

- `POST /api/v1/laptop/ask` - Ask questions about laptop manuals

### User Management

- `POST /api/v1/users/signup` - User registration
- `POST /api/v1/users/login` - User authentication

## 🤖 AI Integration Workflow

1. **File Upload**: User uploads laptop PDF manual
2. **Text Extraction**: Worker extracts text using pdf-parse
3. **Embedding Generation**: Gemini API creates vector embeddings
4. **Vector Storage**: Embeddings stored in Pinecone with metadata
5. **Question Processing**: User questions are embedded and matched
6. **Context Retrieval**: Relevant docs retrieved via similarity search
7. **Answer Generation**: Gemini generates contextual responses

## 🔄 Background Processing

The system uses Redis queues for asynchronous operations:

- **File Processing Queue**: Handles PDF parsing and vectorization
- **File Deletion Queue**: Manages cleanup of files and vectors
- **Automatic Triggers**: Mongoose hooks automatically queue jobs

## 📊 Key Features

### Advanced Querying

```javascript
// Example: Filter, sort, and paginate
GET /api/v1/laptop?brand=HP&price[gte]=500&sort=-price&page=2&limit=10
```

### Manual Files Processing

- Automatic text extraction from PDF manuals
- Vector embeddings for semantic search
- Background processing to avoid blocking requests

### AI-Powered Q&A

```json
POST /api/v1/laptop/ask
{
  "question": "What is the battery life of HP Pavilion laptops?"
}
```

### Error Handling

- Comprehensive global error handler
- Graceful app exiting on unhandled promise rejections and exceptions
- Queue job retry mechanisms with exponential backoff
- Structured error responses with detailed logging

## 📝 Usage Examples

### Creating a Laptop with Manual

```bash
curl -X POST http://localhost:3000/api/v1/laptop \
  -F "model_name=HP Pavilion 15" \
  -F "brand=HP" \
  -F "price=699" \
  -F "manual=@laptop_manual.pdf"
```

### Asking About a Laptop

```bash
curl -X POST http://localhost:3000/api/v1/laptop/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What should I do if I need to replace the battery in the Apple MacBook Air 2020 MGND3HN Laptop?"}'
```

## 📊 Dataset

The application uses a laptop dataset for testing and demonstration purposes. The dataset contains detailed specifications and information about various laptop models from different manufacturers.

**Source**: [Laptops Dataset - Kaggle](https://www.kaggle.com/datasets/sushmita36/laptops-dataset)

## 📄 License

This project is licensed under the MIT License.

---

**Note**: Make sure to configure all environment variables and external services (MongoDB, Redis, Pinecone, Gemini API) before running the application.
