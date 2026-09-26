export const repoUrl = 'https://github.com/leandromlmoreira/aws-pharma-architecture'
export const liveUrl = 'https://leandromlmoreira.github.io/aws-pharma-architecture/'

export function fileUrl(file: string): string {
  return `${repoUrl}/blob/main/${file}`
}
