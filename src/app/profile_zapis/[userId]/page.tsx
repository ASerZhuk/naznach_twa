import { getGrafikById } from '@/app/actions/getGrafikById'
import Client from './client'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'
import { AppRoot } from '@telegram-apps/telegram-ui'
import { getServicesById } from '@/app/actions/getServicesById'

interface ProfilePageProps {
	params: {
		userId: string
	}
}

const ProfilePage = async ({ params }: ProfilePageProps) => {
	const user = await getSpecialistByUseId(params.userId)
	const grafik = await getGrafikById(params.userId)
	const service = await getServicesById(params.userId)
	if (!user) {
		return <div>Пользователь не найден</div>
	}

	return <Client user={user} grafik={grafik} service={service} />
}

export default ProfilePage
