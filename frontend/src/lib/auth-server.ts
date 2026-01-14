import { cookies } from "next/headers";
import { ClassMemberResponse } from "@/types/class";
import { Role } from "@/types/auth";
import httpClient from "./axios";

/**
 * Server-side authentication utilities
 * For use in Server Components only
 */

/**
 * Get current user ID from JWT token stored in cookies
 * @returns User ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    // Decode JWT token to get userId (token format: header.payload.signature)
    // payload contains: { sub: userId, email: userEmail, role: userRole }
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
    return parseInt(payload.sub);
  } catch (error) {
    console.error("Failed to get current user ID:", error);
    return null;
  }
}

export async function getCurrentUserRole(): Promise<Role | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());

    const roleValue = 
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? // ASP.NET role claim, log payload ra để kiểm tra
      payload.role ?? 
      payload.Role ?? 
      payload.roles;

    if (roleValue === 0 || roleValue === Role.Admin || roleValue === "Admin") {
      return Role.Admin;
    }

    if (roleValue === 1 || roleValue === Role.User || roleValue === "User") {
      return Role.User;
    }

    return null;
  } catch (error) {
    console.error("Failed to parse user role:", error);
    return null;
  }
}

/**
 * Check if current user is a teacher in a specific class
 * @param classId - The class ID to check
 * @returns true if user is a teacher, false otherwise
 */
export async function isTeacherInClass(classId: number): Promise<boolean> {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return false;
    }

    // Get class members to find current user's role
    // Use longer timeout for SSR requests
    const members: ClassMemberResponse[] = await httpClient.get(
      `/Class/${classId}/Members`,
      { timeout: 30000 } // 30 seconds timeout for SSR
    );

    // Find current user in members list
    const currentMember = members.find((m) => m.userId === currentUserId);

    if (!currentMember) {
      return false;
    }

    // Check if role is "Teacher" (case-insensitive)
    return currentMember.roleInClass.toLowerCase() === "teacher";
  } catch (error) {
    // Log the error but don't crash the page
    // Default to false (student view) on error
    if (error instanceof Error) {
      console.error(`Failed to determine user role for class ${classId}:`, error.message);
    } else {
      console.error("Failed to determine user role:", error);
    }
    return false;
  }
}
