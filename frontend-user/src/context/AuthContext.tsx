import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { Member } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  member: Member | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate a random referral code
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMember = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching member:', error);
        return null;
      }
      return data as Member;
    } catch (error) {
      console.error('Error in fetchMember:', error);
      return null;
    }
  };

  // Auto-create member profile for OAuth users
  const createMemberForUser = async (authUser: User) => {
    try {
      console.log('Attempting to create/find member for:', authUser.email);
      
      // Check if member already exists by email
      const { data: existingMember, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('email_address', authUser.email)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing member:', fetchError);
      }

      if (existingMember) {
        console.log('Found existing member by email:', existingMember.member_id);
        // Link existing member to this auth user if not already linked
        if (!existingMember.user_id) {
          const { error: updateError } = await supabase
            .from('members')
            .update({ user_id: authUser.id })
            .eq('member_id', existingMember.member_id);
          
          if (updateError) {
            console.error('Error linking user:', updateError);
          } else {
            existingMember.user_id = authUser.id;
          }
        }
        return existingMember as Member;
      }

      // Create new member profile
      console.log('Creating new member profile...');
      const userMeta = authUser.user_metadata || {};
      const fullName = userMeta.full_name || userMeta.name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || authUser.email?.split('@')[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Generate unique identifiers to avoid conflicts
      const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      
      const newMember = {
        user_id: authUser.id,
        email_address: authUser.email,
        first_name: firstName,
        last_name: lastName,
        // Required fields - using unique placeholders for OAuth users
        national_id: `PENDING_${uniqueSuffix}`,
        phone_number: `+2547${uniqueSuffix}`,
        date_of_birth: '1990-01-01',
        gender: 'Other',
        tier: 'BRONZE', // Must be uppercase to match DB constraint
        referral_code: generateReferralCode(),
        auth_provider: authUser.app_metadata?.provider || 'google',
        email_verified: authUser.email_confirmed_at ? true : false,
        avatar_url: userMeta.avatar_url || userMeta.picture || null,
      };

      console.log('Inserting new member:', newMember);

      const { data, error } = await supabase
        .from('members')
        .insert(newMember)
        .select()
        .single();

      if (error) {
        console.error('Error creating member:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        return null;
      }

      console.log('Member created successfully:', data);
      return data as Member;
    } catch (error) {
      console.error('Error in createMemberForUser:', error);
      return null;
    }
  };

  // Fetch or create member
  const fetchOrCreateMember = async (authUser: User) => {
    // First try to fetch by user_id
    let memberData = await fetchMember(authUser.id);
    
    if (!memberData) {
      // Try to create/link member
      memberData = await createMemberForUser(authUser);
    }
    
    return memberData;
  };

  useEffect(() => {
    let isMounted = true;

    // Get initial session with timeout
    const initSession = async () => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as Awaited<typeof sessionPromise>;
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const memberData = await fetchOrCreateMember(session.user);
          if (isMounted) setMember(memberData);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initSession();

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const memberData = await fetchOrCreateMember(session.user);
        if (isMounted) setMember(memberData);
      } else {
        setMember(null);
      }
      
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshMember = async () => {
    if (!session?.user) return;
    const memberData = await fetchOrCreateMember(session.user);
    setMember(memberData);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      // Always clear local state, even if signOut fails
      setSession(null);
      setUser(null);
      setMember(null);
    }
  };

  const value = {
    session,
    user,
    member,
    loading,
    signOut,
    refreshMember,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
