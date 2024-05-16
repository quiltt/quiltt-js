import { Link } from 'expo-router'
import type { ComponentProps } from 'react'
import { StyleSheet, Text } from 'react-native'
import { Colors } from '@/constants/Colors'

type ButtonLinkProps = ComponentProps<typeof Link>

export function ButtonLink({ href, style, children, ...props }: ButtonLinkProps) {
  const mergedStyle = [styles.button, style]
  return (
    <Link {...props} href={href} style={mergedStyle}>
      <Text style={styles.text}>{children}</Text>
    </Link>
  )
}

const styles = StyleSheet.create({
  button: {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
})
