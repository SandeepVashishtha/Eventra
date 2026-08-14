# Lost and Found Feature (#11923)

## Overview

A crowdsourced "Lost and Found" bulletin board with client-side image recognition for festival events. This feature allows attendees to upload photos of found items, which are automatically tagged using TensorFlow.js MobileNet for easy searching.

## Features Implemented

### 🎯 Core Functionality
- **Digital Lost & Found Board**: Tab on the public event page
- **Image Upload**: Users can upload photos of found items
- **AI-Powered Tagging**: TensorFlow.js MobileNet for automatic image recognition and tagging
- **Searchable Board**: Items can be searched by text, category, or AI-generated tags
- **Crowdsourced**: Community-driven solution that offloads work from event staff

### 🔧 Backend Components

#### Model
- **LostItem.java** (`Backend/src/main/java/com/sandeep/eventrabackend/model/LostItem.java`)
  - Comprehensive entity with fields for title, description, image URLs, tags, category, location, contact info
  - Status tracking (FOUND, CLAIMED, RETURNED, ARCHIVED)
  - Relationships to Event and User entities
  - Timestamps for creation and updates

#### Repository
- **LostItemRepository.java** (`Backend/src/main/java/com/sandeep/eventrabackend/repository/LostItemRepository.java`)
  - Custom query methods for filtering by event, status, category
  - Search functionality by keyword and tags
  - Count methods for statistics

#### Service
- **LostItemService.java** (`Backend/src/main/java/com/sandeep/eventrabackend/service/LostItemService.java`)
  - Business logic for CRUD operations
  - Mapping between entities and DTOs
  - Authorization checks (only owners can edit/delete)
  - Comprehensive filtering and search

#### Controller
- **LostItemController.java** (`Backend/src/main/java/com/sandeep/eventrabackend/controller/LostItemController.java`)
  - RESTful API endpoints under `/api/events/{eventId}/lost-items`
  - Full OpenAPI/Swagger documentation
  - Proper error handling and response codes

#### DTOs
- **CreateLostItemRequest.java**: Input validation for new items
- **UpdateLostItemRequest.java**: Input validation for updates
- **LostItemResponse.java**: Full item details for responses

#### Exception
- **ResourceNotFoundException.java**: Standard exception for not found resources

### 🖥️ Frontend Components

#### Main Components
- **LostAndFoundBoard.jsx** (`src/components/events/LostAndFoundBoard.jsx`)
  - Main container component integrated into EventDetails page
  - State management for items, filters, search, modals
  - Image upload with AI recognition
  - Form for adding new lost items
  - Grid/List view toggle
  - Real-time filtering and search

- **LostItemCard.jsx** (`src/components/events/LostItemCard.jsx`)
  - Individual item display with image, title, description
  - Status badges (Found, Claimed, etc.)
  - AI-generated tags display
  - Contact information section
  - Claim and delete actions

#### Services
- **lostAndFoundService.js** (`src/services/lostAndFoundService.js`)
  - API communication layer
  - Methods for all CRUD operations
  - Image upload handling
  - Error handling

- **imageRecognitionService.js** (`src/services/imageRecognitionService.js`)
  - TensorFlow.js MobileNet integration
  - Image recognition with configurable parameters
  - Category mapping from MobileNet classes to user-friendly categories
  - Tag extraction and formatting
  - Memory management and cleanup

#### Styles
- **LostAndFoundBoard.css** (`src/components/events/LostAndFoundBoard.css`)
  - Responsive grid layouts
  - Hover effects and transitions
  - Status badge styling
  - Modal and upload area styles

### 🎨 UI Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Grid/List Views**: Toggle between grid and list layouts
- **Advanced Filtering**: Filter by category, tags, status, and search query
- **Image Recognition**: Automatic tagging when uploading images
- **Real-time Updates**: Instant filtering and search results
- **Status Indicators**: Visual indicators for found/claimed items
- **Modal Forms**: Clean modal interfaces for adding items
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: Graceful error messages and retry options

## API Endpoints

### GET Endpoints
- `GET /api/events/{eventId}/lost-items` - Get all lost items for an event
- `GET /api/events/{eventId}/lost-items/unclaimed` - Get only unclaimed items
- `GET /api/events/{eventId}/lost-items/{id}` - Get specific item by ID
- `GET /api/events/{eventId}/lost-items/tag/{tag}` - Get items by AI tag
- `GET /api/events/{eventId}/lost-items/category/{category}` - Get items by category
- `GET /api/events/{eventId}/lost-items/search?q={query}` - Search items
- `GET /api/events/{eventId}/lost-items/count` - Get item counts

### POST Endpoints
- `POST /api/events/{eventId}/lost-items` - Create new lost item
- `POST /api/events/{eventId}/lost-items/{id}/claim` - Mark item as claimed

### PUT Endpoints
- `PUT /api/events/{eventId}/lost-items/{id}` - Update lost item

### DELETE Endpoints
- `DELETE /api/events/{eventId}/lost-items/{id}` - Delete lost item

## Dependencies Added

### Backend (Maven)
No new dependencies required - uses existing Spring Boot stack.

### Frontend (NPM)
```json
{
  "@tensorflow/tfjs": "^4.20.0",
  "@tensorflow-models/mobilenet": "^2.1.0"
}
```

## Usage

### For Users (Attendees)

1. **Finding an Item**:
   - Navigate to any event page
   - Scroll to the Lost & Found section
   - Browse existing items or use search/filters
   - Click "Add Found Item" to report a found item

2. **Adding an Item**:
   - Click "Add Found Item" button
   - Upload a photo of the item
   - Wait for AI to analyze and suggest tags
   - Fill in item details (title, description, category, etc.)
   - Submit the form

3. **Claiming an Item**:
   - Find your lost item in the board
   - Click "Claim" button
   - Confirm the claim
   - Contact the finder using provided contact information

### For Developers

#### Backend Integration
The backend is automatically integrated through Spring Boot's component scanning. No additional configuration needed.

#### Frontend Integration
The feature is integrated into EventDetails.js:

```jsx
import LostAndFoundBoard from "components/events/LostAndFoundBoard";

// In your EventDetails component
<div className="mt-8">
  <LostAndFoundBoard />
</div>
```

## Image Recognition

The feature uses TensorFlow.js MobileNet for client-side image recognition:

- **Model**: MobileNet v1 (pre-trained on ImageNet)
- **Size**: ~5MB compressed
- **Inference Time**: ~100-300ms on modern devices
- **Categories**: 1000+ object classes
- **Auto-tagging**: Maps MobileNet predictions to user-friendly categories

### Supported Categories
Keys, Wallet, Phone, Jacket, Backpack, Sunglasses, Watch, Laptop, Tablet, Camera, Water bottle, Umbrella, Hat, Glasses, Headphones, Charger, Cable, Bag, Shoes, Clothing, Jewelry, Book, Document, ID, Passport, Ticket, Money, Credit card

## Performance Considerations

- **Lazy Loading**: MobileNet model loads on-demand when first used
- **Memory Management**: Model is cleaned up when component unmounts
- **Image Compression**: Large images are resized before processing
- **Caching**: Model weights are cached by the browser

## Security

- **Authentication**: All write operations require authentication
- **Authorization**: Only item owners can edit/delete their items
- **Input Validation**: Full validation on both client and server
- **File Upload**: Image uploads are validated (type, size)

## Error Handling

- **Network Errors**: Automatic retry with user feedback
- **Model Loading**: Fallback to manual tagging if model fails to load
- **Image Processing**: Graceful degradation if recognition fails
- **Form Validation**: Client-side validation with user-friendly messages

## Future Enhancements

- [ ] Server-side image storage (S3, Cloudinary, etc.)
- [ ] Email notifications when items are claimed
- [ ] Geolocation tagging for where items were found
- [ ] Image similarity search (find visually similar items)
- [ ] Moderation system for inappropriate content
- [ ] Analytics dashboard for event organizers
- [ ] Mobile app integration
- [ ] Offline support with sync when online
- [ ] Multi-language support for tags and descriptions

## Testing

The feature includes comprehensive error handling and fallback mechanisms. Manual testing is recommended for:

1. Image upload and recognition accuracy
2. Filtering and search functionality
3. Mobile responsiveness
4. Performance with many items
5. Error scenarios (network failure, model loading failure)

## Deployment Notes

1. **Frontend**: The TensorFlow.js model will be automatically downloaded by users' browsers on first use
2. **Backend**: No special deployment steps required
3. **Database**: Hibernate will automatically create the `lost_items` and `lost_item_tags` tables

## Issue Reference

This implementation addresses feature request #11923: "Crowdsourced 'Lost and Found' bulletin board with image recognition"