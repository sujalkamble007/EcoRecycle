# E-Waste Pickup Flow

## Complete User Journey

### 1. **Upload Image** (`/classify`)
- User uploads an image of their e-waste item
- AI classifies the item into categories:
  - Cable
  - Battery
  - TV
  - Mobile
  - Laptop
  - Other
- Shows confidence score of classification

### 2. **Schedule Pickup** (`/schedule`)
After successful classification, user fills out three sections:

#### Contact Information
- Full Name (required, 2-100 characters)
- Phone Number (required, 10-20 digits)
- Email (required, valid email format)

#### Pickup Schedule
- Preferred Date (required, must be today or future)
- Preferred Time (required)

#### Pickup Location
- Address (required, 5-500 characters)
- Simple text input field for entering the pickup address

### 3. **Confirm Pickup**
- User clicks "Confirm Pickup" button
- System validates all form data
- Creates pickup request in database
- **Calculates estimated pickup time:**
  - Adds 2-4 hours to the scheduled time
  - Provides realistic arrival window

### 4. **Success Page** (`/success`)
Displays confirmation with:

#### Pickup Details Card
- ⏰ **Estimated Pickup Time** - When the team will likely arrive (highlighted in primary color)
- 📅 **Scheduled Date & Time** - User's preferred time
- 📦 **Item Category** - Type of e-waste
- 📍 **Pickup Address** - Full address
- 🆔 **Pickup ID** - Unique identifier for tracking

#### Additional Features
- Environmental impact message
- "What's Next?" section explaining the process
- Options to:
  - Recycle more items
  - Return to home page

## Technical Implementation

### Data Flow
```
1. Image Upload → AI Classification
2. Classification Result → Schedule Form
3. Form Submission → Database Insert
4. Calculate Estimate → Navigate to Success
5. Display Details → User Confirmation
```

### Database Schema
```sql
pickup_requests:
- id (UUID)
- user_id (UUID, foreign key)
- name (TEXT)
- email (TEXT)
- phone (TEXT)
- category (TEXT)
- address (TEXT)
- latitude (DECIMAL) - set to null
- longitude (DECIMAL) - set to null
- pickup_date (DATE)
- pickup_time (TIME)
- confidence_score (DECIMAL)
- image_url (TEXT)
- status (TEXT, default: 'pending')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Estimated Time Calculation
- Base: Scheduled date and time
- Window: +2 to 4 hours (random)
- Format: Full date/time display with day name
- Example: "Mon, Oct 18, 02:30 PM"

## User Experience Benefits

1. **Clear Expectations** - Users know exactly when to expect pickup
2. **Complete Information** - All pickup details in one place
3. **Tracking Reference** - Pickup ID for future reference
4. **Confirmation** - Visual feedback with success indicators
5. **Flexibility** - Can schedule more pickups or return home

## Future Enhancements

- Real-time tracking of pickup vehicle
- SMS notifications for pickup status
- Ability to reschedule pickups
- Pickup history for users
- Rating and feedback system
