# Forward API Documentation

The Forward API enables users to forward mail items to delivery addresses using multiple shipping carriers. The system integrates with EasyPost to provide real-time shipping rates and handles the complete forwarding workflow.

## Overview

The forwarding process consists of two main stages:
1. **Quote Stage**: Get shipping rates and options
2. **Purchase Stage**: Create forwarding request and purchase shipping label

## Authentication

All endpoints require Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

---

## Customer Endpoints

### 1. Get Forwarding Quote

**Endpoint:** `POST /api/forward/quote`

**Description:** Retrieves shipping rates and options for forwarding a mail item to a specific delivery address. This endpoint calculates shipping costs from multiple carriers (USPS, UPS, FedEx, DHL) and returns available delivery speed and packaging options.

**Request Body:**
```json
{
  "mailId": "25de0024-2ca9-4ed7-81f5-3dc468956c93",
  "deliveryAddressId": "943c9c3d-44f1-444f-bfee-b61497a50dda"
}
```

**Response (200):**
```json
{
  "rates": [
    {
      "id": "rate_8c3f4e9df6a24dbebccc463523b6e2ae",
      "carrier": "USPS",
      "service": "GroundAdvantage",
      "rate": 11800,
      "currency": "USD",
      "delivery_days": 2,
      "delivery_date": "2025-01-15",
      "delivery_date_guaranteed": false,
      "est_delivery_days": 2,
      "list_rate": 11800,
      "retail_rate": 12100
    }
  ],
  "summary": {
    "totalRatesFound": 3,
    "cheapestRate": { /* cheapest rate object */ },
    "fastestRate": { /* fastest rate object */ },
    "availableCarriers": ["USPS", "UPS", "FedEx"],
    "averagePrice": 15000,
    "priceRange": { "min": 11800, "max": 25000 }
  },
  "deliverySpeedOptions": [
    {
      "id": "7772b11d-afb0-4281-a054-a9249a051144",
      "label": "FAST",
      "title": "Fastest Delivery",
      "description": "Delivered within 3 business days",
      "price": 500
    }
  ],
  "packagingTypeOptions": [
    {
      "id": "37bba193-77b1-4fa5-af5a-83aebb3266d1",
      "label": "STANDARD_BOX",
      "title": "Standard Box",
      "description": "A standard cardboard box",
      "price": 200
    }
  ],
  "mail": { /* mail object */ },
  "deliveryAddress": { /* delivery address object */ },
  "officeLocation": { /* office location object */ }
}
```

**Error Responses:**
- `400`: Mail dimensions are required for shipping quote calculation
- `404`: Mail item or delivery address not found

---

### 2. Calculate Forwarding Cost

**Endpoint:** `POST /api/forward/calculate-cost`

**Description:** Calculates the total cost breakdown for forwarding a mail item including base shipping cost, delivery speed fees, packaging fees, and service fees. Use this before creating a forwarding request to show users the final cost.

**Request Body:**
```json
{
  "selectedRate": {
    "id": "rate_8c3f4e9df6a24dbebccc463523b6e2ae",
    "carrier": "USPS",
    "service": "GroundAdvantage",
    "rate": 11800,
    "currency": "USD",
    "delivery_days": 2
  },
  "deliverySpeedOptionId": "7772b11d-afb0-4281-a054-a9249a051144",
  "packagingTypeOptionId": "37bba193-77b1-4fa5-af5a-83aebb3266d1",
  "officeLocationId": "59dad8d5-503c-4ab6-b3f0-e44410678595",
  "serviceFee": 100
}
```

**Response (200):**
```json
{
  "baseShippingCost": 11800,
  "deliverySpeedFee": 500,
  "packagingFee": 200,
  "serviceFee": 100,
  "totalCost": 12600
}
```

---

### 3. Create Forwarding Request

**Endpoint:** `POST /api/forward/requests`

**Description:** Creates a forwarding request for a mail item. This endpoint purchases a shipping label from EasyPost, deducts the cost from workspace balance, and initiates the forwarding process. The mail handler will receive the request for physical processing.

**Request Body:**
```json
{
  "mailId": "25de0024-2ca9-4ed7-81f5-3dc468956c93",
  "mailboxId": "90597468-2ddb-40e8-99ff-8c0044fa10cd",
  "deliveryAddressId": "943c9c3d-44f1-444f-bfee-b61497a50dda",
  "deliverySpeedOptionId": "7772b11d-afb0-4281-a054-a9249a051144",
  "packagingTypeOptionId": "37bba193-77b1-4fa5-af5a-83aebb3266d1",
  "selectedRate": {
    "id": "rate_8c3f4e9df6a24dbebccc463523b6e2ae",
    "carrier": "USPS",
    "service": "GroundAdvantage",
    "rate": 11800,
    "currency": "USD",
    "delivery_days": 2,
    "delivery_date": null
  },
  "deliverySpeedFee": 500,
  "packagingFee": 200,
  "serviceFee": 100,
  "priority": "STANDARD"
}
```

**Response (201):**
```json
{
  "id": "ca5b3aac-8e45-41e9-bfd1-98027d704bff",
  "mailId": "25de0024-2ca9-4ed7-81f5-3dc468956c93",
  "easypostRateId": "rate_8c3f4e9df6a24dbebccc463523b6e2ae",
  "easypostShipmentId": "shp_8556fdceae3d459e9b3d1d5d16403fe2",
  "selectedCarrier": "USPS",
  "selectedService": "GroundAdvantage",
  "trackingCode": "9434600208303110397236",
  "labelUrl": "https://easypost-files.s3.us-west-2.amazonaws.com/files/postage_label/...",
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "costBreakdown": {
    "baseShippingCost": 11800,
    "deliverySpeedFee": 500,
    "packagingFee": 200,
    "serviceFee": 100,
    "totalCost": 12600
  },
  "createdAt": "2025-09-03T14:47:18.620Z",
  "mail": { /* mail object */ },
  "deliveryAddress": { /* delivery address object */ },
  "deliverySpeedOption": { /* delivery speed option object */ },
  "packagingTypeOption": { /* packaging type option object */ }
}
```

**Error Responses:**
- `400`: Selected shipping option no longer available. Please get a new quote.
- `400`: Shipping price has changed from $X to $Y. Please get a new quote.
- `404`: Mail item, delivery address, or related options not found

---

### 4. Get Forwarding Request Details

**Endpoint:** `GET /api/forward/requests/{id}`

**Description:** Retrieves detailed information about a specific forwarding request.

**Parameters:**
- `id` (path): Forwarding request ID

**Response (200):**
```json
{
  "forwardingRequest": {
    "id": "ca5b3aac-8e45-41e9-bfd1-98027d704bff",
    "status": "PENDING",
    "trackingCode": "9434600208303110397236",
    "selectedCarrier": "USPS",
    "selectedService": "GroundAdvantage",
    "totalCost": 12600,
    "createdAt": "2025-09-03T14:47:18.620Z"
  },
  "trackingInfo": { /* EasyPost tracking details */ }
}
```

---

### 5. Track Forwarding Request

**Endpoint:** `GET /api/forward/requests/{id}/track`

**Description:** Retrieves real-time tracking information for a forwarding request from the shipping carrier. Provides detailed shipment status, location updates, and delivery progress.

**Parameters:**
- `id` (path): Forwarding request ID

**Response (200):**
```json
{
  "forwardingRequest": {
    "id": "ca5b3aac-8e45-41e9-bfd1-98027d704bff",
    "trackingCode": "9434600208303110397236",
    "selectedCarrier": "USPS",
    "selectedService": "GroundAdvantage",
    "status": "PENDING"
  },
  "trackingInfo": {
    "id": "trk_123",
    "tracking_code": "9434600208303110397236",
    "status": "in_transit",
    "status_detail": "Package is in transit",
    "tracking_details": [
      {
        "datetime": "2025-01-12T10:30:00Z",
        "status": "departed_facility",
        "message": "Departed USPS facility",
        "city": "New York",
        "state": "NY"
      }
    ]
  }
}
```

**Error Responses:**
- `400`: No tracking code available for this request
- `404`: Forwarding request not found

---

### 6. Cancel Forwarding Request

**Endpoint:** `PUT /api/forward/requests/{id}/cancel`

**Description:** Cancels a forwarding request (only possible before completion).

**Parameters:**
- `id` (path): Forwarding request ID

**Response (200):**
```json
{
  "id": "ca5b3aac-8e45-41e9-bfd1-98027d704bff",
  "status": "CANCELLED",
  "cancelledAt": "2025-09-03T15:30:00.000Z"
}
```

**Error Responses:**
- `400`: Cannot cancel completed request
- `404`: Forwarding request not found

---

## Mail Handler Endpoints

### 1. Get Forwarding Requests for Handler

**Endpoint:** `GET /api/mail-handler/forward/requests`

**Description:** Retrieves a list of forwarding requests for a specific office location. Mail handlers use this endpoint to see which packages need to be processed and shipped to customers.

**Query Parameters:**
- `officeLocationId` (required): Office location ID where the mail handler is assigned
- `status` (optional): Filter requests by status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED, FAILED)

**Example:** `GET /api/mail-handler/forward/requests?officeLocationId=59dad8d5-503c-4ab6-b3f0-e44410678595&status=PENDING`

**Response (200):**
```json
[
  {
    "id": "ca5b3aac-8e45-41e9-bfd1-98027d704bff",
    "status": "PENDING",
    "selectedCarrier": "USPS",
    "selectedService": "GroundAdvantage",
    "trackingCode": "9434600208303110397236",
    "totalCost": 12225,
    "createdAt": "2025-09-03T14:47:18.620Z",
    "mail": {
      "id": "25de0024-2ca9-4ed7-81f5-3dc468956c93",
      "type": "CONSOLIDATED",
      "width": 30,
      "height": 20,
      "length": 25,
      "weight": 2.5
    },
    "deliveryAddress": {
      "id": "943c9c3d-44f1-444f-bfee-b61497a50dda",
      "label": "Home Address",
      "addressLine": "123 Main Street, Apt 4B",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  }
]
```

---

### 2. Mark Forwarding Request as Completed

**Endpoint:** `PUT /api/mail-handler/forward/requests/{id}/complete`

**Description:** Marks a forwarding request as completed after the mail handler has physically shipped the package to the carrier. This updates the request status and records the completion timestamp.

**Parameters:**
- `id` (path): Forwarding request ID

**Response (200):**
```json
{
  "id": "ca5b3aac-8e45-41e9-bfd1-98027d704bff",
  "status": "COMPLETED",
  "completedAt": "2025-09-03T15:30:00.000Z",
  "trackingCode": "9434600208303110397236",
  "selectedCarrier": "USPS",
  "selectedService": "GroundAdvantage"
}
```

**Error Responses:**
- `400`: Request is already completed
- `404`: Forwarding request not found

---

### 3. Cancel Forwarding Request (Handler)

**Endpoint:** `PUT /api/mail-handler/forward/requests/{id}/cancel`

**Description:** Allows mail handlers to cancel forwarding requests.

**Parameters:**
- `id` (path): Forwarding request ID

**Response (200):**
```json
{
  "id": "ca5b3aac-8e45-41e9-bfd1-98027d704bff",
  "status": "CANCELLED",
  "cancelledAt": "2025-09-03T15:30:00.000Z"
}
```

---

### 4. Get Forwarding Request Details (Handler)

**Endpoint:** `GET /api/mail-handler/forward/requests/{id}`

**Description:** Retrieves detailed information about a specific forwarding request for mail handlers.

**Parameters:**
- `id` (path): Forwarding request ID

**Response (200):**
```json
{
  "forwardingRequest": {
    "id": "ca5b3aac-8e45-41e9-bfd1-98027d704bff",
    "trackingCode": "9434600208303110397236",
    "selectedCarrier": "USPS",
    "selectedService": "GroundAdvantage",
    "status": "PENDING"
  },
  "trackingInfo": { /* EasyPost tracking details */ }
}
```

---

## Debug Endpoints (Development Only)

### 1. Debug EasyPost Rates

**Endpoint:** `POST /api/forward/debug/rates`

**Description:** Test endpoint to directly test EasyPost rate calculation with custom addresses and parcel data.

**Request Body:**
```json
{
  "fromAddress": {
    "name": "VMH Office",
    "street1": "447 Broadway",
    "street2": "Suite 200",
    "city": "New York",
    "state": "NY",
    "zip": "10013",
    "country": "US"
  },
  "toAddress": {
    "name": "Recipient",
    "street1": "123 Main Street, Apt 4B",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  },
  "parcel": {
    "length": 25,
    "width": 30,
    "height": 20,
    "weight": 2.5
  }
}
```

### 2. Debug Mail Data

**Endpoint:** `POST /api/forward/debug/mail-data`

**Description:** Debug endpoint to check mail and address data processing.

**Request Body:**
```json
{
  "mailId": "25de0024-2ca9-4ed7-81f5-3dc468956c93",
  "deliveryAddressId": "943c9c3d-44f1-444f-bfee-b61497a50dda"
}
```

---

## Error Handling

### Common Error Responses

**Bad Request (400):**
```json
{
  "message": "Selected shipping option no longer available. Please get a new quote.",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Not Found (404):**
```json
{
  "message": "Mail not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### Price Protection System

The API implements a price protection system with ±$5.00 tolerance:
- If shipping price changes by more than $5, the request is rejected
- Users must get a new quote if prices change significantly
- Carrier and service matching ensures users get the expected shipping option

---

## Workflow Example

### Complete Forwarding Workflow

1. **Get Quote:**
   ```bash
   POST /api/forward/quote
   ```

2. **Calculate Final Cost:**
   ```bash
   POST /api/forward/calculate-cost
   ```

3. **Create Forwarding Request:**
   ```bash
   POST /api/forward/requests
   ```

4. **Track Progress:**
   ```bash
   GET /api/forward/requests/{id}/track
   ```

5. **Handler Marks Complete:**
   ```bash
   PUT /api/mail-handler/forward/requests/{id}/complete
   ```

---

## Cost Structure

All costs are in cents (USD):
- **Base Shipping Cost**: From EasyPost carrier rates
- **Delivery Speed Fee**: Additional fee for faster delivery options
- **Packaging Fee**: Fee for special packaging options
- **Service Fee**: Platform service fee
- **Total Cost**: Sum of all fees above

**Example Cost Breakdown:**
```
Base Shipping (USPS GroundAdvantage): $118.00
Delivery Speed Fee (Fast):            $5.00
Packaging Fee (Standard Box):         $2.00
Service Fee (Platform):               $1.00
─────────────────────────────────────────────
TOTAL COST:                          $126.00
```

---

## Integration Notes

### EasyPost Integration
- Real-time shipping rates from major carriers
- Automatic label generation and tracking
- Address validation and normalization
- Country code standardization (US, CA, etc.)

### Workspace Balance Integration
- Automatic balance deduction upon request creation
- Balance transaction logging
- Debt tracking for insufficient funds
- Auto-creation of workspace balance if missing

### Mail Status Updates
- Mail `isForwarded` flag set to true upon request creation
- Integration with mail tracking system
- Status synchronization between forwarding and mail systems
