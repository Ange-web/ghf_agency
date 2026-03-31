#!/usr/bin/env python3
"""
GHF Agency Admin Features Testing Suite
Tests new admin features: event creation, contest creation, photo moderation, table reservations
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class AdminFeaturesAPITester:
    def __init__(self, base_url: str = "https://neon-nights-booking.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session = requests.Session()
        self.admin_token = None
        self.user_token = None
        self.user_session = None
        self.test_event_id = None
        self.test_contest_id = None
        self.test_photo_id = None
        
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        print(f"🚀 Starting GHF Agency Admin Features Tests")
        print(f"📍 Base URL: {base_url}")
        print("=" * 60)

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {name}")
        
        if details:
            print(f"     └─ {details}")
            
        if not success:
            self.failed_tests.append({
                "test": name,
                "details": details,
                "response": response_data
            })
        else:
            self.tests_passed += 1
        print()

    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    expected_status: int = 200, use_admin: bool = False, 
                    use_user: bool = False) -> tuple[bool, Dict]:
        """Make HTTP request with proper headers and cookies"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        # For admin/user requests, we rely on cookies set during login
        # The session will automatically include cookies
            
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers)
            else:
                return False, {"error": f"Unsupported method: {method}"}
                
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}
                
            return success, response_data
            
        except Exception as e:
            return False, {"error": str(e)}

    def setup_auth(self):
        """Setup admin and user authentication"""
        # Admin login - this will set cookies in the session
        admin_data = {
            "email": "admin@ghfagency.com",
            "password": "GHFAdmin2024!"
        }
        success, data = self.make_request('POST', '/auth/login', admin_data)
        if success and 'access_token' in data:
            self.admin_token = data['access_token']
            print("✅ Admin authentication setup successful")
            print(f"   Admin cookies: {len(self.session.cookies)} cookies set")
        else:
            print("❌ Admin authentication failed")
            return False
            
        # Create a separate session for user to avoid cookie conflicts
        self.user_session = requests.Session()
        
        # User registration for testing
        timestamp = datetime.now().strftime("%H%M%S")
        user_data = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@ghftest.com",
            "password": "TestPass123!"
        }
        
        # Use user session for user registration
        url = f"{self.api_url}/auth/register"
        response = self.user_session.post(url, json=user_data, headers={'Content-Type': 'application/json'})
        
        if response.status_code == 200:
            data = response.json()
            self.user_token = data['access_token']
            print("✅ User authentication setup successful")
            print(f"   User cookies: {len(self.user_session.cookies)} cookies set")
        else:
            print("❌ User authentication failed")
            
        return True

    def make_user_request(self, method: str, endpoint: str, data: Dict = None, 
                         expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request using user session"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
            
        try:
            if method.upper() == 'GET':
                response = self.user_session.get(url, headers=headers)
            elif method.upper() == 'POST':
                response = self.user_session.post(url, json=data, headers=headers)
            elif method.upper() == 'PUT':
                response = self.user_session.put(url, json=data, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.user_session.delete(url, headers=headers)
            else:
                return False, {"error": f"Unsupported method: {method}"}
                
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}
                
            return success, response_data
            
        except Exception as e:
            return False, {"error": str(e)}

    def test_admin_create_event(self):
        """Test admin creating a new event with table options"""
        if not self.admin_token:
            self.log_test("Admin Create Event", False, "No admin token available")
            return
            
        event_data = {
            "title": "Test Event Admin",
            "description": "Test event created by admin API test",
            "date": (datetime.now() + timedelta(days=30)).isoformat(),
            "location": "Test Venue",
            "image_url": "https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg",
            "price": 25.0,
            "capacity": 100,
            "category": "party",
            "has_table_promo": True,
            "table_promo_price": 150.0,
            "table_promo_capacity": 10,
            "has_table_vip": True,
            "table_vip_price": 300.0,
            "table_vip_capacity": 5
        }
        
        success, data = self.make_request('POST', '/events', event_data, 200, use_admin=True)
        
        if success and 'id' in data:
            self.test_event_id = data['id']
            self.log_test(
                "Admin Create Event",
                True,
                f"Event ID: {data['id']} | Tables: Promo={data.get('has_table_promo')}, VIP={data.get('has_table_vip')}"
            )
        else:
            self.log_test(
                "Admin Create Event",
                False,
                f"Failed to create event: {data.get('detail', 'Unknown error')}",
                data
            )

    def test_admin_create_contest(self):
        """Test admin creating a new contest"""
        if not self.admin_token:
            self.log_test("Admin Create Contest", False, "No admin token available")
            return
            
        contest_data = {
            "title": "Test Contest Admin",
            "description": "Test contest created by admin API test",
            "prize": "Test Prize Package",
            "end_date": (datetime.now() + timedelta(days=7)).isoformat(),
            "image_url": "https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg"
        }
        
        success, data = self.make_request('POST', '/contests', contest_data, 200, use_admin=True)
        
        if success and 'id' in data:
            self.test_contest_id = data['id']
            self.log_test(
                "Admin Create Contest",
                True,
                f"Contest ID: {data['id']} | Prize: {data.get('prize')}"
            )
        else:
            self.log_test(
                "Admin Create Contest",
                False,
                f"Failed to create contest: {data.get('detail', 'Unknown error')}",
                data
            )

    def test_user_photo_submission(self):
        """Test user submitting a photo for approval"""
        if not self.user_token:
            self.log_test("User Photo Submission", False, "No user token available")
            return
            
        photo_data = {
            "title": "Test Photo Submission",
            "url": "https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg",
            "event_id": self.test_event_id
        }
        
        success, data = self.make_user_request('POST', '/photos/submit', photo_data, 200)
        
        if success and 'id' in data:
            self.test_photo_id = data['id']
            self.log_test(
                "User Photo Submission",
                True,
                f"Photo ID: {data['id']} | Status: {data.get('status')}"
            )
        else:
            self.log_test(
                "User Photo Submission",
                False,
                f"Failed to submit photo: {data.get('detail', 'Unknown error')}",
                data
            )

    def test_admin_pending_photos(self):
        """Test admin getting pending photos"""
        if not self.admin_token:
            self.log_test("Admin Pending Photos", False, "No admin token available")
            return
            
        success, data = self.make_request('GET', '/photos/pending', use_admin=True)
        
        if success and isinstance(data, list):
            pending_count = len(data)
            self.log_test(
                "Admin Pending Photos",
                True,
                f"Found {pending_count} pending photos"
            )
        else:
            self.log_test(
                "Admin Pending Photos",
                False,
                f"Failed to get pending photos: {data}",
                data
            )

    def test_admin_approve_photo(self):
        """Test admin approving a photo"""
        if not self.admin_token or not self.test_photo_id:
            self.log_test("Admin Approve Photo", False, "No admin token or photo ID available")
            return
            
        approval_data = {"approved": True}
        success, data = self.make_request('PUT', f'/photos/{self.test_photo_id}/approve', 
                                        approval_data, 200, use_admin=True)
        
        self.log_test(
            "Admin Approve Photo",
            success and 'message' in data,
            f"Response: {data.get('message', 'Unknown')}"
        )

    def test_table_promo_reservation(self):
        """Test table promo reservation"""
        if not self.user_token or not self.test_event_id:
            self.log_test("Table Promo Reservation", False, "Missing user token or event ID")
            return
            
        reservation_data = {
            "event_id": self.test_event_id,
            "table_type": "promo",
            "name": "Test User Promo",
            "phone": "+33 6 12 34 56 78",
            "email": "testpromo@ghftest.com",
            "guests": 4,
            "special_requests": "Test promo table reservation"
        }
        
        success, data = self.make_user_request('POST', '/tables/reserve', reservation_data, 200)
        
        if success and 'id' in data:
            self.log_test(
                "Table Promo Reservation",
                True,
                f"Reservation ID: {data['id']} | Type: {data.get('table_type')} | Price: {data.get('price')}€"
            )
        else:
            self.log_test(
                "Table Promo Reservation",
                False,
                f"Failed to reserve promo table: {data.get('detail', 'Unknown error')}",
                data
            )

    def test_table_vip_reservation(self):
        """Test table VIP reservation"""
        if not self.user_token or not self.test_event_id:
            self.log_test("Table VIP Reservation", False, "Missing user token or event ID")
            return
            
        reservation_data = {
            "event_id": self.test_event_id,
            "table_type": "vip",
            "name": "Test User VIP",
            "phone": "+33 6 12 34 56 78",
            "email": "testvip@ghftest.com",
            "guests": 6,
            "special_requests": "Test VIP table reservation"
        }
        
        success, data = self.make_user_request('POST', '/tables/reserve', reservation_data, 200)
        
        if success and 'id' in data:
            self.log_test(
                "Table VIP Reservation",
                True,
                f"Reservation ID: {data['id']} | Type: {data.get('table_type')} | Price: {data.get('price')}€"
            )
        else:
            self.log_test(
                "Table VIP Reservation",
                False,
                f"Failed to reserve VIP table: {data.get('detail', 'Unknown error')}",
                data
            )

    def test_admin_table_reservations(self):
        """Test admin getting all table reservations"""
        if not self.admin_token:
            self.log_test("Admin Table Reservations", False, "No admin token available")
            return
            
        success, data = self.make_request('GET', '/admin/table-reservations', use_admin=True)
        
        if success and isinstance(data, list):
            reservations_count = len(data)
            self.log_test(
                "Admin Table Reservations",
                True,
                f"Found {reservations_count} table reservations"
            )
        else:
            self.log_test(
                "Admin Table Reservations",
                False,
                f"Failed to get table reservations: {data}",
                data
            )

    def test_my_table_reservations(self):
        """Test user getting their table reservations"""
        if not self.user_token:
            self.log_test("My Table Reservations", False, "No user token available")
            return
            
        success, data = self.make_user_request('GET', '/tables/my', 200)
        
        if success and isinstance(data, list):
            reservations_count = len(data)
            self.log_test(
                "My Table Reservations",
                True,
                f"Found {reservations_count} table reservations"
            )
        else:
            self.log_test(
                "My Table Reservations",
                False,
                f"Failed to get my table reservations: {data}",
                data
            )

    def run_all_tests(self):
        """Run all admin features tests"""
        print("🧪 Running Admin Features Tests...\n")
        
        # Setup authentication
        if not self.setup_auth():
            print("❌ Authentication setup failed, aborting tests")
            return False
        
        # Admin functionality tests
        self.test_admin_create_event()
        self.test_admin_create_contest()
        
        # Photo submission and moderation
        self.test_user_photo_submission()
        self.test_admin_pending_photos()
        self.test_admin_approve_photo()
        
        # Table reservations
        self.test_table_promo_reservation()
        self.test_table_vip_reservation()
        self.test_my_table_reservations()
        self.test_admin_table_reservations()
        
        # Print summary
        self.print_summary()
        return len(self.failed_tests) == 0

    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("📊 ADMIN FEATURES TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"{i}. {test['test']}")
                print(f"   Details: {test['details']}")
                if test.get('response'):
                    print(f"   Response: {json.dumps(test['response'], indent=2)[:200]}...")
                print()
        
        print("=" * 60)

def main():
    """Main test runner"""
    tester = AdminFeaturesAPITester()
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())