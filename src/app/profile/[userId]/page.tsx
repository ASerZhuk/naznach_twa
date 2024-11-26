import { getGrafikById } from '@/app/actions/getGrafikById'
import Client from './client'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'
import { AppRoot } from '@telegram-apps/telegram-ui'

interface ProfilePageProps {
	params: {
		userId: string
	}
}

const ProfilePage = async ({ params }: ProfilePageProps) => {
	const user = await getSpecialistByUseId(params.userId)
	const grafik = await getGrafikById(params.userId)
	if (!user) {
		return <div>Пользователь не найден</div>
	}

	return (
		<AppRoot>
			<Client user={user} grafik={grafik} />
		</AppRoot>
	)
}

export default ProfilePage
