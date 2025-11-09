import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Lightbulb, Users, Share2, Tag, Star, Image } from 'lucide-react';

interface WelcomeScreenProps {
  onClose: () => void;
}

export function WelcomeScreen({ onClose }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-center">
            Velkommen til Design Ideas! 🎨
          </CardTitle>
          <CardDescription className="text-center">
            Din kreative idébank med sosiale funksjoner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Hva er dette?
            </h3>
            <p className="text-muted-foreground">
              Design Ideas er en plattform for å administrere dine kreative ideer. Skriv ned konsepter, organiser dem med tags og prioritetsnivåer, last opp bilder, og del dem med andre kreative mennesker.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2">
              Hovedfunksjoner:
            </h3>
            
            <div className="grid gap-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4>Lagre ideer</h4>
                  <p className="text-sm text-muted-foreground">
                    Skriv ned alle detaljer om dine designkonsepter
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4>Organiser med tags</h4>
                  <p className="text-sm text-muted-foreground">
                    Bruk tags, prioritetsnivåer og status for å holde oversikt
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Image className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4>Last opp bilder</h4>
                  <p className="text-sm text-muted-foreground">
                    Illustrer ideene dine med bilder og skisser
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4>Del med verden</h4>
                  <p className="text-sm text-muted-foreground">
                    Publiser ideene dine og se hva andre skaper
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h4>Følg andre kreative</h4>
                  <p className="text-sm text-muted-foreground">
                    Finn inspirasjon fra andre brukere og samarbeid på ideer
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Kom i gang:
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
              <li>Klikk på "+ Ny idé" knappen for å legge til din første idé</li>
              <li>Utforsk "Discover" fanen for å se hva andre deler</li>
              <li>Søk etter andre brukere og følg dem for å se deres ideer</li>
              <li>Del dine beste ideer med fellesskapet!</li>
            </ol>
          </div>

          <Button onClick={onClose} className="w-full">
            Kom i gang! 🚀
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
