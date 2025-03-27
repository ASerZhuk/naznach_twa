interface AdminClientProps {
	users: {
		id: number
		telegramId: string | null
		firstName: string | null
		lastName: string | null
		chatId: string | null
		username: string | null
		isMaster: boolean
		createdAt: Date
	}[]
}

const AdminClient: React.FC<AdminClientProps> = ({ users }) => {
	return (
		<div>
			{users.map((user, index) => (
				<div>{user.firstName}</div>
			))}
		</div>
	)
}

export default AdminClient
