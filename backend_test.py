#!/usr/bin/env python3
"""
GHF Agency Backend API Testing Suite
Tests all API endpoints for the event management system
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class GHFAgencyAPITester:
    def __init__(self, base_url: str = "https://neon-nights-booking.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session = requests.Session()
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.test_event_id = None
        self.test_reservation_id = None
        self.test_contest_id = None
        
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        print(f"🚀 Starting GHF Agency API Tests")
        print(f"📍 Base URL: {base_url}")
        print(f"🔗 API URL: {self.api_url}")
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
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        # Add auth token if needed
        if use_admin and self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'
        elif use_user and self.user_token:
            headers['Authorization'] = f'Bearer {self.user_token}'
            
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

    def test_health_check(self):
        """Test basic API health"""
        success, data = self.make_request('GET', '/')
        self.log_test(
            "API Health Check", 
            success and data.get('message') == 'GHF Agency API',
            f"Status: {data.get('status', 'unknown')}"
        )

    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "email": "admin@ghfagency.com",
            "password": "GHFAdmin2024!"
        }
        
        success, data = self.make_request('POST', '/auth/login', login_data)
        
        if success and 'access_token' in data:
            self.admin_token = data['access_token']
            self.log_test(
                "Admin Login",
                True,
                f"Admin: {data.get('name', 'Unknown')} | Role: {data.get('role', 'Unknown')}"
            )
        else:
            self.log_test(
                "Admin Login",
                False,
                f"Login failed: {data.get('detail', 'Unknown error')}",
                data
            )

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        register_data = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@ghftest.com",
            "password": "TestPass123!"
        }
        
        success, data = self.make_request('POST', '/auth/register', register_data, 200)
        
        if success and 'access_token' in data:
            self.user_token = data['access_token']
            self.test_user_id = data.get('id')
            self.log_test(
                "User Registration",
                True,
                f"User: {data.get('name')} | Email: {data.get('email')}"
            )
        else:
            self.log_test(
                "User Registration",
                False,
                f"Registration failed: {data.get('detail', 'Unknown error')}",
                data
            )

    def test_auth_me(self):
        """Test getting current user info"""
        if not self.user_token:
            self.log_test("Auth Me", False, "No user token available")
            return
            
        success, data = self.make_request('GET', '/auth/me', use_user=True)
        self.log_test(
            "Auth Me",
            success and 'email' in data,
            f"User ID: {data.get('id', 'Unknown')}"
        )

    def test_events_list(self):
        """Test getting events list"""
        success, data = self.make_request('GET', '/events')
        
        if success and isinstance(data, list):
            events_count = len(data)
            if events_count > 0:
                self.test_event_id = data[0].get('id')
            self.log_test(
                "Events List",
                True,
                f"Found {events_count} events"
            )
        else:
            self.log_test(
                "Events List",
                False,
                f"Failed to get events: {data}",
                data
            )

    def test_single_event(self):
        """Test getting single event"""
        if not self.test_event_id:
            self.log_test("Single Event", False, "No event ID available")
            return
            
        success, data = self.make_request('GET', f'/events/{self.test_event_id}')
        self.log_test(
            "Single Event",
            success and data.get('id') == self.test_event_id,
            f"Event: {data.get('title', 'Unknown')}"
        )

    def test_gallery_list(self):
        """Test getting gallery items"""
        success, data = self.make_request('GET', '/gallery')
        
        if success and isinstance(data, list):
            gallery_count = len(data)
            self.log_test(
                "Gallery List",
                True,
                f"Found {gallery_count} gallery items"
            )
        else:
            self.log_test(
                "Gallery List",
                False,
                f"Failed to get gallery: {data}",
                data
            )

    def test_contests_list(self):
        """Test getting contests list"""
        success, data = self.make_request('GET', '/contests')
        
        if success and isinstance(data, list):
            contests_count = len(data)
            if contests_count > 0:
                self.test_contest_id = data[0].get('id')
            self.log_test(
                "Contests List",
                True,
                f"Found {contests_count} contests"
            )
        else:
            self.log_test(
                "Contests List",
                False,
                f"Failed to get contests: {data}",
                data
            )

    def test_testimonials_list(self):
        """Test getting testimonials"""
        success, data = self.make_request('GET', '/testimonials')
        
        if success and isinstance(data, list):
            testimonials_count = len(data)
            self.log_test(
                "Testimonials List",
                True,
                f"Found {testimonials_count} testimonials"
            )
        else:
            self.log_test(
                "Testimonials List",
                False,
                f"Failed to get testimonials: {data}",
                data
            )

    def test_create_reservation(self):
        """Test creating a reservation"""
        if not self.user_token or not self.test_event_id:
            self.log_test("Create Reservation", False, "Missing user token or event ID")
            return
            
        reservation_data = {
            "event_id": self.test_event_id,
            "guests": 2,
            "phone": "+33 6 12 34 56 78",
            "special_requests": "Test reservation from API test"
        }
        
        success, data = self.make_request('POST', '/reservations', reservation_data, 200, use_user=True)
        
        if success and 'id' in data:
            self.test_reservation_id = data['id']
            self.log_test(
                "Create Reservation",
                True,
                f"Reservation ID: {data['id']} | Guests: {data.get('guests', 0)}"
            )
        else:
            self.log_test(
                "Create Reservation",
                False,
                f"Failed to create reservation: {data.get('detail', 'Unknown error')}",
                data
            )

    def test_my_reservations(self):
        """Test getting user's reservations"""
        if not self.user_token:
            self.log_test("My Reservations", False, "No user token available")
            return
            
        success, data = self.make_request('GET', '/reservations/my', use_user=True)
        
        if success and isinstance(data, list):
            reservations_count = len(data)
            self.log_test(
                "My Reservations",
                True,
                f"Found {reservations_count} reservations"
            )
        else:
            self.log_test(
                "My Reservations",
                False,
                f"Failed to get reservations: {data}",
                data
            )

    def test_contest_participation(self):
        """Test participating in a contest"""
        if not self.user_token or not self.test_contest_id:
            self.log_test("Contest Participation", False, "Missing user token or contest ID")
            return
            
        participation_data = {
            "contest_id": self.test_contest_id,
            "answer": "Test participation answer"
        }
        
        success, data = self.make_request('POST', f'/contests/{self.test_contest_id}/participate', 
                                        participation_data, 200, use_user=True)
        
        self.log_test(
            "Contest Participation",
            success and 'message' in data,
            f"Response: {data.get('message', 'Unknown')}"
        )

    def test_admin_stats(self):
        """Test admin statistics endpoint"""
        if not self.admin_token:
            self.log_test("Admin Stats", False, "No admin token available")
            return
            
        success, data = self.make_request('GET', '/admin/stats', use_admin=True)
        
        if success and 'users' in data:
            self.log_test(
                "Admin Stats",
                True,
                f"Users: {data.get('users', 0)} | Events: {data.get('events', 0)} | Reservations: {data.get('reservations', 0)}"
            )
        else:
            self.log_test(
                "Admin Stats",
                False,
                f"Failed to get stats: {data}",
                data
            )

    def test_logout(self):
        """Test logout functionality"""
        success, data = self.make_request('POST', '/auth/logout')
        self.log_test(
            "Logout",
            success and 'message' in data,
            f"Response: {data.get('message', 'Unknown')}"
        )

    def test_protected_endpoint_without_auth(self):
        """Test that protected endpoints require authentication"""
        success, data = self.make_request('GET', '/auth/me', expected_status=401)
        self.log_test(
            "Protected Endpoint (No Auth)",
            success,  # We expect 401, so success means it's properly protected
            "Correctly returns 401 for unauthenticated request"
        )

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🧪 Running Backend API Tests...\n")
        
        # Basic tests
        self.test_health_check()
        self.test_protected_endpoint_without_auth()
        
        # Auth tests
        self.test_admin_login()
        self.test_user_registration()
        self.test_auth_me()
        
        # Public endpoint tests
        self.test_events_list()
        self.test_single_event()
        self.test_gallery_list()
        self.test_contests_list()
        self.test_testimonials_list()
        
        # Protected functionality tests
        self.test_create_reservation()
        self.test_my_reservations()
        self.test_contest_participation()
        
        # Admin tests
        self.test_admin_stats()
        
        # Cleanup
        self.test_logout()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("📊 TEST SUMMARY")
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
        return len(self.failed_tests) == 0

def main():
    """Main test runner"""
    tester = GHFAgencyAPITester()
    success = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())