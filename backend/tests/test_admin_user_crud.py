"""
Test cases for Admin User Management API
Phase 1: Create User and Delete User

RED PHASE: These tests define the expected behavior.
They will FAIL until we implement the actual functionality.
"""
import pytest


def auth_header(token):
    """Create authorization header."""
    return {"Authorization": f"Bearer {token}"}


class TestAdminCreateUser:
    """Test cases for POST /api/admin/users (Create User)"""

    @pytest.mark.asyncio
    async def test_create_user_as_admin_should_return_201(self, client, admin_user, admin_token):
        """
        Test: Admin should be able to create a new user.
        Expected: 201 Created with user data.
        """
        response = await client.post(
            "/api/admin/users",
            headers=auth_header(admin_token),
            json={
                "name": "New User",
                "email": "newuser@test.com",
                "password": "securepassword123",
                "role": "buyer"
            }
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New User"
        assert data["email"] == "newuser@test.com"
        assert data["role"] == "buyer"
        assert data["is_active"] is True
        assert "password" not in data
        assert "password_hash" not in data

    @pytest.mark.asyncio
    async def test_create_seller_user_should_return_201(self, client, admin_user, admin_token):
        """
        Test: Admin should be able to create a seller user.
        Expected: 201 Created with role 'seller'.
        """
        response = await client.post(
            "/api/admin/users",
            headers=auth_header(admin_token),
            json={
                "name": "Seller Baru",
                "email": "sellernew@test.com",
                "password": "password123",
                "role": "seller"
            }
        )

        assert response.status_code == 201
        data = response.json()
        assert data["role"] == "seller"

    @pytest.mark.asyncio
    async def test_create_user_without_name_should_return_422(self, client, admin_user, admin_token):
        """
        Test: Creating user without name should fail validation.
        Expected: 422 Unprocessable Entity.
        """
        response = await client.post(
            "/api/admin/users",
            headers=auth_header(admin_token),
            json={
                "email": "test@test.com",
                "password": "password123",
                "role": "buyer"
            }
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_user_with_duplicate_email_should_return_400(self, client, admin_user, buyer_user, admin_token):
        """
        Test: Creating user with existing email should fail.
        Expected: 400 Bad Request.
        """
        response = await client.post(
            "/api/admin/users",
            headers=auth_header(admin_token),
            json={
                "name": "Duplicate User",
                "email": buyer_user.email,
                "password": "password123",
                "role": "buyer"
            }
        )

        assert response.status_code == 400
        assert "email" in response.json()["detail"].lower() or "exists" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_create_user_as_buyer_should_return_403(self, client, buyer_user, buyer_token):
        """
        Test: Non-admin users should not be able to create users.
        Expected: 403 Forbidden.
        """
        response = await client.post(
            "/api/admin/users",
            headers=auth_header(buyer_token),
            json={
                "name": "Test User",
                "email": "test@test.com",
                "password": "password123",
                "role": "buyer"
            }
        )

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_create_user_without_auth_should_return_401(self, client):
        """
        Test: Unauthenticated requests should be rejected.
        Expected: 401 Unauthorized.
        """
        response = await client.post(
            "/api/admin/users",
            json={
                "name": "Test User",
                "email": "test@test.com",
                "password": "password123",
                "role": "buyer"
            }
        )

        assert response.status_code == 401


class TestAdminDeleteUser:
    """Test cases for DELETE /api/admin/users/{user_id} (Delete User)"""

    @pytest.mark.asyncio
    async def test_delete_user_as_admin_should_return_200(self, client, admin_user, regular_users, admin_token):
        """
        Test: Admin should be able to delete a user.
        Expected: 200 OK with success message.
        """
        user_to_delete = regular_users[0]

        response = await client.delete(
            f"/api/admin/users/{user_to_delete.id}",
            headers=auth_header(admin_token)
        )

        assert response.status_code == 200
        data = response.json()
        assert "deleted" in data.get("message", "").lower() or data.get("message", "") != ""

    @pytest.mark.asyncio
    async def test_delete_nonexistent_user_should_return_404(self, client, admin_user, admin_token):
        """
        Test: Deleting non-existent user should return 404.
        Expected: 404 Not Found.
        """
        response = await client.delete(
            "/api/admin/users/99999",
            headers=auth_header(admin_token)
        )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_delete_admin_own_account_should_return_400(self, client, admin_user, admin_token):
        """
        Test: Admin should not be able to delete their own account.
        Expected: 400 Bad Request.
        """
        response = await client.delete(
            f"/api/admin/users/{admin_user.id}",
            headers=auth_header(admin_token)
        )

        assert response.status_code == 400
        assert "own" in response.json()["detail"].lower() or "yourself" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_delete_user_as_buyer_should_return_403(self, client, buyer_user, regular_users, buyer_token):
        """
        Test: Non-admin users should not be able to delete users.
        Expected: 403 Forbidden.
        """
        response = await client.delete(
            f"/api/admin/users/{regular_users[0].id}",
            headers=auth_header(buyer_token)
        )

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_delete_user_without_auth_should_return_401(self, client, regular_users):
        """
        Test: Unauthenticated requests should be rejected.
        Expected: 401 Unauthorized.
        """
        response = await client.delete(f"/api/admin/users/{regular_users[0].id}")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_deleted_user_cannot_login(self, client, admin_user, regular_users, admin_token):
        """
        Test: Deleted user should not be able to login.
        Expected: Login fails with 401.
        """
        user_to_delete = regular_users[0]

        # Delete the user
        delete_response = await client.delete(
            f"/api/admin/users/{user_to_delete.id}",
            headers=auth_header(admin_token)
        )
        assert delete_response.status_code == 200

        # Try to login with deleted user's credentials
        login_response = await client.post(
            "/api/auth/login",
            json={"email": user_to_delete.email, "password": "password123"}
        )

        assert login_response.status_code == 401

    @pytest.mark.asyncio
    async def test_deleted_user_not_in_list(self, client, admin_user, regular_users, admin_token):
        """
        Test: Deleted user should not appear in user list.
        Expected: User not found in GET /api/admin/users.
        """
        user_to_delete = regular_users[0]
        user_id = user_to_delete.id

        # Delete the user
        await client.delete(
            f"/api/admin/users/{user_id}",
            headers=auth_header(admin_token)
        )

        # Get all users
        list_response = await client.get("/api/admin/users", headers=auth_header(admin_token))
        assert list_response.status_code == 200

        user_ids = [u["id"] for u in list_response.json()]
        assert user_id not in user_ids


class TestAdminUserManagementIntegration:
    """Integration tests for Admin User Management CRUD operations."""

    @pytest.mark.asyncio
    async def test_full_crud_workflow(self, client, admin_user, admin_token):
        """
        Test: Complete CRUD workflow - Create, Read, Update, Delete.
        Expected: All operations succeed in sequence.
        """
        headers = auth_header(admin_token)

        # 1. CREATE - Create a new user
        create_response = await client.post(
            "/api/admin/users",
            headers=headers,
            json={
                "name": "Workflow Test User",
                "email": "workflow@test.com",
                "password": "testpass123",
                "role": "buyer"
            }
        )
        assert create_response.status_code == 201
        created_user = create_response.json()
        user_id = created_user["id"]

        # 2. READ - Verify user exists
        list_response = await client.get("/api/admin/users", headers=headers)
        assert list_response.status_code == 200
        user_ids = [u["id"] for u in list_response.json()]
        assert user_id in user_ids

        # 3. UPDATE - Change user role
        update_role_response = await client.patch(
            f"/api/admin/users/{user_id}/role",
            headers=headers,
            json={"role": "seller"}
        )
        assert update_role_response.status_code == 200
        assert update_role_response.json()["role"] == "seller"

        # 4. DELETE - Remove the user
        delete_response = await client.delete(
            f"/api/admin/users/{user_id}",
            headers=headers
        )
        assert delete_response.status_code == 200

        # 5. VERIFY - User no longer exists
        final_list_response = await client.get("/api/admin/users", headers=headers)
        final_user_ids = [u["id"] for u in final_list_response.json()]
        assert user_id not in final_user_ids

    @pytest.mark.asyncio
    async def test_cannot_delete_already_deleted_user(self, client, admin_user, regular_users, admin_token):
        """
        Test: Attempting to delete an already deleted user should return 404.
        Expected: 404 Not Found on second delete attempt.
        """
        headers = auth_header(admin_token)
        user_to_delete = regular_users[0]

        # First delete - should succeed
        first_delete = await client.delete(
            f"/api/admin/users/{user_to_delete.id}",
            headers=headers
        )
        assert first_delete.status_code == 200

        # Second delete - should fail with 404
        second_delete = await client.delete(
            f"/api/admin/users/{user_to_delete.id}",
            headers=headers
        )
        assert second_delete.status_code == 404
