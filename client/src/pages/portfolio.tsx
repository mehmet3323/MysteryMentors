import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { useGitHubStats } from "@/hooks/use-github-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Moon, 
  Sun, 
  Menu, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  ExternalLink,
  Download,
  ChevronDown,
  Star,
  GitFork,
  Eye,
  Users,
  Code,
  Briefcase,
  GraduationCap,
  Award
} from "lucide-react";

export default function Portfolio() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [skillsInView, setSkillsInView] = useState(false);

  const { stats, featuredProjects, isLoading } = useGitHubStats("mehmet3323");

  // Navigation scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "skills", "projects", "contact"];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Skills animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSkillsInView(true);
        }
      },
      { threshold: 0.5 }
    );

    const skillsSection = document.getElementById("skills");
    if (skillsSection) {
      observer.observe(skillsSection);
    }

    return () => observer.disconnect();
  }, []);

  const skills = [
    { name: "C#", level: 85, color: "from-purple-500 to-purple-600" },
    { name: "Java", level: 80, color: "from-orange-500 to-red-500" },
    { name: "React Native", level: 75, color: "from-blue-500 to-cyan-500" },
    { name: "SQL", level: 70, color: "from-green-500 to-emerald-500" },
    { name: "Agile & Scrum", level: 90, color: "from-indigo-500 to-purple-500" },
    { name: "Problem Çözme", level: 85, color: "from-pink-500 to-rose-500" },
    { name: "Algoritma Tasarımı", level: 80, color: "from-amber-500 to-orange-500" },
    { name: "Takım Çalışması", level: 95, color: "from-teal-500 to-green-500" },
  ];

  const projects = [
    {
      title: "C# Hayvan Besleme Sistemi",
      description: "C# dili ile geliştirilmiş hayvan besleme ve takip sistemi.",
      technologies: ["C#", "Desktop App", ".NET"],
      icon: "🐾",
      github: "https://github.com/mehmet3323",
      gradient: "from-green-400 via-blue-500 to-purple-600",
    },
    {
      title: "Kütüphane Web Sitesi",
      description: "Modern ve kullanıcı dostu kütüphane yönetim web sitesi.",
      technologies: ["Web", "Responsive", "JavaScript"],
      icon: "📚",
      demo: "https://github.com/mehmet3323",
      gradient: "from-purple-500 via-pink-500 to-red-500",
    },
    {
      title: "Coğrafi Bilgi Sistemi",
      description: "Harita tabanlı veri görselleştirme ve analiz sistemi.",
      technologies: ["GIS", "Data Viz", "Mapping"],
      icon: "🗺️",
      github: "https://github.com/mehmet3323",
      gradient: "from-cyan-500 via-teal-500 to-green-500",
    },
    {
      title: "Code23 Mobil Uygulaması",
      description: "Code23 kursunda geliştirdiğim mobil uygulama projesi.",
      technologies: ["Flutter", "Mobile", "Dart"],
      icon: "📱",
      github: "https://github.com/mehmet3323",
      gradient: "from-indigo-600 via-purple-600 to-pink-600",
    },
  ];

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        activeSection === href.slice(1) 
          ? "bg-primary text-primary-foreground shadow-lg" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
    </a>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-background/95 backdrop-blur-lg border-b border-border/40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <span className="font-bold text-lg text-white">MM</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg gradient-text">Mehmet Müjdeci</h1>
                <p className="text-xs text-muted-foreground">Yazılım Mühendisi</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 bg-muted/30 rounded-full p-1">
              <NavLink href="#home">Ana Sayfa</NavLink>
              <NavLink href="#about">Hakkımda</NavLink>
              <NavLink href="#skills">Yetenekler</NavLink>
              <NavLink href="#projects">Projeler</NavLink>
              <NavLink href="#contact">İletişim</NavLink>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full hover:bg-primary/10"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border/40">
            <div className="px-6 py-4 space-y-2">
              <NavLink href="#home">Ana Sayfa</NavLink>
              <NavLink href="#about">Hakkımda</NavLink>
              <NavLink href="#skills">Yetenekler</NavLink>
              <NavLink href="#projects">Projeler</NavLink>
              <NavLink href="#contact">İletişim</NavLink>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center gradient-bg overflow-hidden">
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full floating-animation"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full floating-animation" style={{animationDelay: "2s"}}></div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-white/10 rounded-full floating-animation" style={{animationDelay: "4s"}}></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="fade-in">
            {/* Profile Image */}
            <div className="mx-auto w-48 h-48 mb-8 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin" style={{animationDuration: "8s"}}></div>
              <div className="absolute inset-1 rounded-full bg-gray-900"></div>
              <img 
                src="https://media.licdn.com/dms/image/v2/D4D35AQH_wwvaj68UyA/profile-framedphoto-shrink_200_200/profile-framedphoto-shrink_200_200/0/1710167849005?e=1750006800&v=beta&t=9ekvfbPYi9twUkrrejBkfMhIM_4hyFwiH8k8BrGAc0M" 
                alt="Mehmet Müjdeci" 
                className="absolute inset-2 w-44 h-44 rounded-full object-cover"
              />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-4 slide-up">
              MEHMET MÜJDECİ
            </h1>
            
            <p className="text-xl md:text-2xl font-light mb-8 slide-up" style={{animationDelay: "0.2s"}}>
              Yazılım Mühendisi & Problem Çözücü
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12 slide-up" style={{animationDelay: "0.4s"}}>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">C#</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">Java</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">React Native</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">SQL</Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up" style={{animationDelay: "0.6s"}}>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 hover-lift">
                <a href="#contact">
                  <Mail className="mr-2 h-4 w-4" />
                  İletişime Geç
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/80 text-white bg-white/10 hover:bg-white hover:text-primary transition-all duration-300 hover-lift backdrop-blur-sm">
                <a href="#projects">
                  <Code className="mr-2 h-4 w-4" />
                  Projelerimi Gör
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bounce-gentle">
          <ChevronDown className="text-white text-2xl" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Hakkımda</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Okulda aldığım dersler dışında farklı kurslarda eğitim alarak kişisel gelişimim üzerinde çalışıyorum.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Card className="hover-lift card-premium">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <GraduationCap className="mr-3 text-primary" />
                    Eğitim
                  </h3>
                  <div>
                    <h4 className="font-semibold">Fırat Üniversitesi</h4>
                    <p className="text-muted-foreground">Teknoloji Fakültesi - Yazılım Mühendisliği</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift card-premium">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Award className="mr-3 text-primary" />
                    Sertifikalar
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Flutter Eğitimi</h4>
                        <p className="text-sm text-muted-foreground">Fırat Üniversitesi</p>
                      </div>
                      <span className="text-sm text-primary font-medium">2023-2024</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Java Eğitimi</h4>
                        <p className="text-sm text-muted-foreground">Inspimo Şirketi</p>
                      </div>
                      <span className="text-sm text-primary font-medium">2023-2024</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Code23 Mobil Programlama Eğitimi</h4>
                        <p className="text-sm text-muted-foreground">Code23</p>
                      </div>
                      <span className="text-sm text-primary font-medium">2024-2025</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="gradient-bg text-white hover-lift">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Eye className="mr-3" />
                    Kariyer Hedefi
                  </h3>
                  <p className="leading-relaxed">
                    Yeni teknolojilere ayak uydurarak yapay zeka farkındalığı ile dünya çapında projeler de yer alacak bir yazılım mühendisi olmak istiyorum.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-lift card-premium">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Briefcase className="mr-3 text-primary" />
                    İş Deneyimi
                  </h3>
                  <div>
                    <h4 className="font-medium">NIK Bilgi Teknolojilerinde</h4>
                    <p className="text-muted-foreground">20 günlük yaz stajımı tamamladım</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift card-premium">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Users className="mr-3 text-primary" />
                    Diller
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Türkçe</span>
                      <span className="text-primary font-medium">Ana Dil</span>
                    </div>
                    <div className="flex justify-between">
                      <span>İngilizce</span>
                      <span className="text-primary font-medium">A2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Yetenekler</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Sürekli öğrenme ve gelişim odaklı yaklaşımımla edindiğim teknik yetenekler
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {skills.map((skill, index) => (
              <div key={skill.name} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-primary font-semibold">{skill.level}%</span>
                </div>
                <Progress 
                  value={skillsInView ? skill.level : 0} 
                  className="h-3 transition-all duration-1000 ease-out"
                  style={{ transitionDelay: `${index * 100}ms` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Projeler</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Farklı teknolojiler kullanarak geliştirdiğim projeler ve GitHub istatistiklerim
            </p>
          </div>

          {/* GitHub Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <Github className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold">{isLoading ? "-" : stats.repos}</h3>
                <p className="text-muted-foreground">Repositories</p>
              </CardContent>
            </Card>
            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <Star className="w-8 h-8 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-2xl font-bold">{isLoading ? "-" : stats.stars}</h3>
                <p className="text-muted-foreground">Total Stars</p>
              </CardContent>
            </Card>
            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <GitFork className="w-8 h-8 mx-auto mb-4 text-green-500" />
                <h3 className="text-2xl font-bold">{isLoading ? "-" : stats.forks}</h3>
                <p className="text-muted-foreground">Total Forks</p>
              </CardContent>
            </Card>
            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <Users className="w-8 h-8 mx-auto mb-4 text-blue-500" />
                <h3 className="text-2xl font-bold">{isLoading ? "-" : stats.followers}</h3>
                <p className="text-muted-foreground">Followers</p>
              </CardContent>
            </Card>
          </div>

          {/* GitHub Projects */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-8 text-center">GitHub Repolarım</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8">
                  <p>GitHub repoları yükleniyor...</p>
                </div>
              ) : featuredProjects && featuredProjects.length > 0 ? (
                featuredProjects.map((repo) => (
                  <Card key={repo.name} className="hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold text-lg">{repo.name}</h4>
                        <Button asChild size="icon" variant="ghost">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">
                        {repo.description || "Açıklama bulunmuyor"}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-primary"></div>
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3 h-3" />
                            {repo.forks_count}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p>Hiçbir GitHub reposu bulunamadı</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">İletişim</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Benimle iletişime geçmek için aşağıdaki iletişim bilgilerini kullanabilirsiniz
            </p>
          </div>

          <div className="mx-auto max-w-xl">
            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="hover-lift">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6">İletişim Bilgileri</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <Mail className="text-primary text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Email</h4>
                        <a href="mailto:mjdc360@gmail.com" className="text-primary hover:underline">
                          mjdc360@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <Phone className="text-primary text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Telefon</h4>
                        <a href="tel:+905432743329" className="text-primary hover:underline">
                          +90 543 274 33 29
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <Linkedin className="text-primary text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold">LinkedIn</h4>
                        <a 
                          href="https://www.linkedin.com/in/m%C3%BCjdeci/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          linkedin.com/in/m%C3%BCjdeci
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <Github className="text-primary text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold">GitHub</h4>
                        <a 
                          href="https://github.com/mehmet3323" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          github.com/mehmet3323
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-bg text-white hover-lift">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Eye className="mr-3" />
                    Projeleriniz İçin Hazırım!
                  </h3>
                  <p className="leading-relaxed">
                    Yeni projeler ve işbirlikleri için her zaman açığım. Birlikte harika şeyler yapalım!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text mb-4">Mehmet Müjdeci</div>
            <p className="text-muted-foreground mb-6">Yazılım Mühendisi & Problem Çözücü</p>
            
            <div className="flex justify-center space-x-6 mb-8">
              <Button asChild variant="outline" size="icon" className="hover-lift">
                <a href="https://github.com/mehmet3323" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="icon" className="hover-lift">
                <a href="https://www.linkedin.com/in/m%C3%BCjdeci/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="icon" className="hover-lift">
                <a href="mailto:mjdc360@gmail.com">
                  <Mail className="h-5 w-5" />
                </a>
              </Button>
            </div>
            
            <div className="border-t pt-8">
              <p className="text-muted-foreground text-sm">
                © 2024 Mehmet Müjdeci. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
