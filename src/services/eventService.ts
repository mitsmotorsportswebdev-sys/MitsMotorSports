export type ParticipantType = 'Individual' | 'Team' | 'Club/Organization'

export type RegistrationData = {
  fullName: string
  email: string
  phone: string
  college: string
  teamName: string
  participantType: ParticipantType | ''
  participantCount: string
  experience: string
  requirements: string
  termsAccepted: boolean
}

export type MockRegistration = RegistrationData & {
  registrationId: string
  submittedAt: string
}

export async function registerForEvent(data: RegistrationData): Promise<MockRegistration> {
  await new Promise((resolve) => window.setTimeout(resolve, 650))

  return {
    ...data,
    registrationId: `MMS-${Date.now()}`,
    submittedAt: new Date().toISOString(),
  }
}
