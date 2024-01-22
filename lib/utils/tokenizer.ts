export const encodeAsync = async (str: string) => {
  // const { encode } = await import('gpt-tokenizer')
  // 计算字符串的价值，字符串的价值需要根据字符类型计算。英语以一个单词为单位来判断，每个价值为1.15，数字以连续的数字为单位来判断，每个价值为1，中文以一个字为单位来判断，每个价值为1.05
  const valule = str
    .split(' ')
    .map(w => {
      if (/^[a-zA-Z]+$/.test(w)) {
        if (w.length > 5) {
          return 2
        }
        return 1.3
      } else if (/^[0-9]+$/.test(w)) {
        return 1
      } else {
        return w.length * 1.05
      }
    })
    .reduce((a, b) => a + b, 0)
  return Math.round(valule)
}
