import Image from "next/image";
import Link from "next/link";
import headerLogo from "../assets/header.png"

export default function Header() {
  return (
    <header className=''>
        <Link href={'/'}>
            <Image
                src={headerLogo}
                alt='Hotseat logo'
                height={35}
                priority={true}
            />
        </Link>
    </header>
  )
}
