export interface StravaHttpProps {
  token: string
  url: string

}

export const stravaGetHttpClient = async (props: StravaHttpProps): Promise<any> => {
  try {
    console.log(props, '<< props')
    const response = await fetch(props.url, {
      method: 'GET',
      headers: {
        // TODO: remove auth through graph
        Authorization: `Bearer ${props.token}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(error)
    throw error
  }
}
