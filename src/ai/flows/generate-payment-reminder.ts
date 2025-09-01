'use server';

/**
 * @fileOverview A payment reminder generation AI agent.
 *
 * - generatePaymentReminder - A function that generates personalized payment reminders for customers.
 * - GeneratePaymentReminderInput - The input type for the generatePaymentReminder function.
 * - GeneratePaymentReminderOutput - The return type for the generatePaymentReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePaymentReminderInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  outstandingAmount: z.number().describe('The outstanding amount owed by the customer.'),
  businessName: z.string().describe('The name of the business.'),
});
export type GeneratePaymentReminderInput = z.infer<typeof GeneratePaymentReminderInputSchema>;

const GeneratePaymentReminderOutputSchema = z.object({
  reminderText: z.string().describe('The generated payment reminder text.'),
});
export type GeneratePaymentReminderOutput = z.infer<typeof GeneratePaymentReminderOutputSchema>;

export async function generatePaymentReminder(input: GeneratePaymentReminderInput): Promise<GeneratePaymentReminderOutput> {
  return generatePaymentReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePaymentReminderPrompt',
  input: {schema: GeneratePaymentReminderInputSchema},
  output: {schema: GeneratePaymentReminderOutputSchema},
  prompt: `You are a helpful assistant that generates payment reminders for businesses.

  Generate a personalized payment reminder for the customer using the following information:

  Customer Name: {{{customerName}}}
  Outstanding Amount: {{{outstandingAmount}}}
  Business Name: {{{businessName}}}

  The payment reminder should be polite and professional, and it should clearly state the outstanding amount and the business name. It should also encourage the customer to make the payment as soon as possible.
  Do not add any salutations or closing remarks.`,
});

const generatePaymentReminderFlow = ai.defineFlow(
  {
    name: 'generatePaymentReminderFlow',
    inputSchema: GeneratePaymentReminderInputSchema,
    outputSchema: GeneratePaymentReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
