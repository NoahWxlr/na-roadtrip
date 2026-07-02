import Link from 'next/link'
import FullBleedImage from './FullBleedImage'
import WideImage from './WideImage'
import PhotoGrid from './PhotoGrid'
import PullQuote from './PullQuote'
import TripStats from './TripStats'

// Components available inside journal MDX files, plus a couple of element
// overrides so standard markdown links/images behave well.
export const mdxComponents = {
  FullBleed: FullBleedImage,
  FullBleedImage,
  WideImage,
  PhotoGrid,
  PullQuote,
  TripStats,
  a: (props: React.ComponentProps<'a'>) => {
    const href = props.href ?? ''
    if (href.startsWith('/')) {
      return <Link href={href}>{props.children}</Link>
    }
    return <a target="_blank" rel="noopener noreferrer" {...props} />
  },
}
