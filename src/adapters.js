function slack2spark (payload) {
  const { text, attachments } = payload
  let markdown = text || ''

  if (attachments && attachments.length) {
    const lines = attachments.map(a => '- ' + a.text).join('\n')
    markdown += '\n\n' + lines
  }

  // replace slack formatted links
  return markdown.replace(/<(.*?)\|(.*?)>/g, (_, a, b) => `[${b}](${a})`)
}

module.exports = { slack2spark }
