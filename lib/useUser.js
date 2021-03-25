import useSWR from 'swr'
import { useEffect } from 'react'
import Router from 'next/router'

const useUser = ({ loginRoute, lastRoute }) => {
  const { data: user, mutate: mutateUser } = useSWR('/api/user')

  useEffect(() => {
    // User not fetched yet - just do nothing
    if (!user) return
    // User fetched and it is confirmed, that user is not logged in - redirect to login page
    if (!user.isLoggedIn && loginRoute) {
      Router.push(loginRoute)
    }
    // User has just logged in - redirect to lastRoute (route that user tried to access, before redirected to login)
    if (user.isLoggedIn && lastRoute) {
      Router.push(lastRoute)
    }
  }, [user])

  return {
    user,
    mutateUser,
  };
}

export default useUser;