import { supabase } from './supabaseClient';
import { Member } from '../types';

const AVATAR_BUCKET = 'avatars';

const editableFields = [
  'first_name',
  'last_name',
  'phone_number',
  'national_id',
  'date_of_birth',
  'gender',
  'physical_address',
  'postal_address',
  'city',
  'country',
  'employment_status',
  'employer_name',
  'occupation'
] as const;

type EditableField = (typeof editableFields)[number];

function buildUpdatePayload(updates: Partial<Member>) {
  const payload: Partial<Record<EditableField, Member[EditableField]>> = {};
  editableFields.forEach((field) => {
    const value = updates[field];
    if (value !== undefined) {
      payload[field] = value as Member[EditableField];
    }
  });
  return payload;
}

export const profileService = {
  async getMember(memberId: number): Promise<Member | null> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('member_id', memberId)
      .single();

    if (error) {
      console.error('Error fetching member profile:', error);
      return null;
    }

    return data as Member;
  },

  async updateMember(memberId: number, updates: Partial<Member>): Promise<Member> {
    const payload = buildUpdatePayload(updates);

    if (Object.keys(payload).length === 0) {
      throw new Error('No fields to update');
    }

    const { data, error } = await supabase
      .from('members')
      .update(payload)
      .eq('member_id', memberId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating member profile:', error);
      throw error;
    }

    return data as Member;
  },

  async uploadAvatar(memberId: number, userId: string, file: File): Promise<string> {
    const extension = file.name.split('.').pop() || 'png';
    const fileName = `${userId}-${Date.now()}.${extension}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
    const publicUrl = data?.publicUrl;

    if (!publicUrl) {
      throw new Error('Unable to retrieve public URL for avatar');
    }

    const { error: updateError } = await supabase
      .from('members')
      .update({ avatar_url: publicUrl })
      .eq('member_id', memberId);

    if (updateError) {
      console.error('Error saving avatar URL:', updateError);
      throw updateError;
    }

    return publicUrl;
  }
};
