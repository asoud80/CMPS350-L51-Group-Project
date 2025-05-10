'use server'

import {
  getAllEnrollments, 
  getEnrollmentById, 
  createEnrollment, 
  updateEnrollment, 
  deleteEnrollment 
} from '@/lib/repo/enrollment.js'; 

import { revalidatePath } from 'next/cache';

export async function addEnrollment(formData) {
    try {
        const enrollment = await createEnrollment(formData);
        revalidatePath('/enrollments');
        return enrollment;
    } catch (error) {
        console.error('Error creating enrollment:', error);
        throw error;
    }
}

export async function fetchEnrollments(searchParams) {
    try {
        const enrollments = await getAllEnrollments(searchParams);
        return enrollments;
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        throw error;
    }
}

export async function fetchEnrollmentDetails(id) {
    try {
        const enrollment = await getEnrollmentById(id);
        return enrollment;
    } catch (error) {
        console.error('Error fetching enrollment details:', error);
        throw error;
    }
}

export async function updateEnrollmentInfo(formData) {
    try {
        const enrollment = await updateEnrollment(formData.id, formData);
        revalidatePath(`/enrollments/${formData.id}`);
        return enrollment;
    } catch (error) {
        console.error('Error updating enrollment:', error);
        throw error;
    }
}

export async function deleteEnrollmentInfo(id) {
    try {
        await deleteEnrollment(id);
        revalidatePath('/enrollments');
    } catch (error) {
        console.error('Error deleting enrollment:', error);
        throw error;
    }
}

