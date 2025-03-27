import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'

import { getServicesById } from '@/app/actions/getServicesById'
import Services from './client'

interface ServicesProps {
	params: {
		userId: string
	}
}

export default async function TimeSlots({ params }: ServicesProps) {
	const user = await getSpecialistByUseId(params.userId)
	const services = await getServicesById(params.userId)

	return <Services specialistId={user?.userId} services={services} />
}
