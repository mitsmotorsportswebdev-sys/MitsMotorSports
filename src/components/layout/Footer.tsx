import { Mail, MapPin, Phone } from 'lucide-react'
import clubLogo from '../../assets/images/faviconLogo (1).jpg'
import instagramIcon from '../../assets/icons/instagram.svg'
import linkedinIcon from '../../assets/icons/linkedin.svg'

export default function Footer() {
  return <footer className="border-y border-white/20 bg-black px-6 py-6 text-sm text-zinc-300 sm:py-7">
    <div className="mx-auto grid max-w-7xl gap-6 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[1fr_1.4fr_1fr]">
      <div className="flex flex-col items-center sm:items-start"><img className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28" src={clubLogo} alt="MITS Motorsports club logo" /><p className="mt-2 max-w-48 text-zinc-400">MITS Motorsports<br />Built for the track.</p></div>
      <div><h2 className="font-display text-lg font-semibold text-white">Contact us</h2><address className="mt-3 space-y-2.5 not-italic"><a className="footer-contact" href="mailto:motorsportsmits@gmail.com"><Mail /> motorsportsmits@gmail.com</a><a className="footer-contact" href="tel:+919778353970"><Phone /> +91 97783 53970</a><a className="footer-contact" href="https://maps.app.goo.gl/zgiep9rD8viKp1KU9" target="_blank" rel="noreferrer"><MapPin /> MITS, Kochi, Kerala, India</a></address></div>
      <div className="flex flex-col items-center gap-3 sm:items-start"><h2 className="font-display text-lg font-semibold text-white">Follow the build</h2><div className="flex gap-3"><a aria-label="Instagram" className="footer-icon" href="https://www.instagram.com/mits_motorsports/" target="_blank" rel="noreferrer"><img src={instagramIcon} alt="" /></a><a aria-label="LinkedIn" className="footer-icon footer-icon-linkedin" href="https://www.linkedin.com/in/mits-motorsports/" target="_blank" rel="noreferrer"><img src={linkedinIcon} alt="" /></a></div></div>
    </div>
    <p className="mx-auto mt-5 max-w-7xl border-t border-white/10 pt-3 text-center text-xs text-zinc-500">© {new Date().getFullYear()} MITS Motorsports. All rights reserved.</p>
  </footer>
}
