import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Mail, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription, // Added for subtle text below title
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator'; // Added for visual separation
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { userEmail, logout } = useAuth();
  const navigate = useNavigate();

  // Helper to extract a display name (can be customized further if needed)
  const getDisplayName = (email: string | null): string => {
    if (!email) return 'User';
    // Simple extraction, could be replaced with a dedicated 'displayName' field if available
    const namePart = email.split('@')[0];
    // Capitalize first letter
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  // Helper for avatar initials
  const getInitials = (email: string | null): string => {
    if (!email) return 'U';
    const namePart = email.split('@')[0];
    if (namePart.length >= 2) {
      return namePart.substring(0, 2).toUpperCase();
    } else if (namePart.length === 1) {
      return namePart.toUpperCase();
    }
    // Fallback if email format is unexpected before '@'
    return email.substring(0, 1).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    // Navigate to login or home page after logout
    navigate('/auth'); // Or '/' depending on your routes
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-8 md:py-12">
      {/* Header Section */}
      <div className="mb-6 flex items-center space-x-4">
        <Button
          variant="outline" // Changed to outline for less emphasis than primary actions
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Go back" // Added aria-label for accessibility
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          User Profile
        </h1>
      </div>

      {/* Profile Card */}
      <Card className="w-full shadow-lg"> {/* Added shadow-lg for more depth */}
        <CardHeader className="items-center text-center pt-6 pb-4"> {/* Adjusted padding */}
          <Avatar className="h-20 w-20 mb-4"> {/* Slightly smaller avatar */}
            {/* Using primary/muted colors for better theme integration */}
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
              {getInitials(userEmail)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl font-medium">
            {getDisplayName(userEmail)}
          </CardTitle>
          {/* Optional: Can show the full email subtly here if desired */}
          <CardDescription>
             {userEmail || 'Email not available'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4 pb-6"> {/* Increased spacing */}
          {/* Email Information Section */}
          <div className="space-y-4">
             <h2 className="text-sm font-medium text-muted-foreground px-1">Account Information</h2> {/* Section title */}
             <Separator /> {/* Visual divider */}
            <div className="flex items-start space-x-4 rounded-md p-3 hover:bg-accent"> {/* Added hover effect */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Email Address</p>
                <p className="text-sm text-muted-foreground pt-1">
                  {userEmail || 'Not provided'}
                </p>
              </div>
            </div>
             {/* Add more profile fields here following the same pattern */}
             {/* Example:
             <div className="flex items-start space-x-4 rounded-md p-3 hover:bg-accent">
               <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                 <User className="h-5 w-5 text-muted-foreground" />
               </div>
               <div>
                 <p className="text-sm font-medium leading-none">Username</p>
                 <p className="text-sm text-muted-foreground pt-1">
                   {getDisplayName(userEmail)}
                 </p>
               </div>
             </div>
             */}
          </div>

          {/* Actions Section */}
          <div className="space-y-4 pt-4">
             <h2 className="text-sm font-medium text-muted-foreground px-1">Actions</h2>
             <Separator />
             {/* Future Edit Button Placeholder - uncomment and implement when ready
             <Button variant="outline" className="w-full">
               <Edit className="mr-2 h-4 w-4" /> Edit Profile
             </Button>
             */}
             <Button
              variant="destructive" // Use destructive variant for sign out
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;