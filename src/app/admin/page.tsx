import { AppRoot } from '@telegram-apps/telegram-ui'
import { getAllUsers } from '../actions/getAllUsers'
import Container from '../components/Container'
import AdminClient from './client'

export default async function Admin() {
	const users: any = await getAllUsers()

	return (
		<div>
			<AppRoot>
				<Container>
					<AdminClient users={users} />
				</Container>
			</AppRoot>
		</div>
	)
}
