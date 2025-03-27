import { AppRoot } from '@telegram-apps/telegram-ui'
import ClientForm from './client'
import { getSpecialistByUseId } from '@/app/actions/getSpecialistByUserId'

interface ProfilePageProps {
	params: {
		userId: string
	}
}

const FormPage = async ({ params }: ProfilePageProps) => {
	const user = await getSpecialistByUseId(params.userId)
	if (!user) {
		return <div>Пользователь не найден</div>
	}

	return <ClientForm user={user} />
}

export default FormPage
