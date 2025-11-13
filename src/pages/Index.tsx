import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  username: string;
  message: string;
  image_url?: string;
  created_at: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState('Аноним');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('chat');

  const CHAT_API = 'https://functions.poehali.dev/16a3e2f7-0d8a-4bd8-ae84-925cc43c67dc';

  const fetchMessages = async (search = '') => {
    try {
      const url = search ? `${CHAT_API}?search=${encodeURIComponent(search)}` : CHAT_API;
      const response = await fetch(url);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(searchQuery), 5000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Введите сообщение');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username || 'Аноним',
          message,
          image_url: imageUrl || null
        })
      });

      if (response.ok) {
        setMessage('');
        setImageUrl('');
        toast.success('Сообщение отправлено!');
        fetchMessages(searchQuery);
      }
    } catch (error) {
      toast.error('Ошибка отправки');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchMessages(searchQuery);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 animate-glow-pulse flex items-center justify-center text-3xl">
              💡
            </div>
            <h1 className="text-3xl md:text-5xl font-pixel glow-text">OneShot</h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground">от Юпитера</p>
          <p className="text-sm text-muted-foreground mt-2">Сообщество игры OneShot</p>
        </header>

        <nav className="flex justify-center gap-4 mb-8 flex-wrap">
          <Button
            variant={activeSection === 'about' ? 'default' : 'outline'}
            onClick={() => setActiveSection('about')}
            className="pixel-corners"
          >
            <Icon name="Lightbulb" size={16} className="mr-2" />
            О игре
          </Button>
          <Button
            variant={activeSection === 'chat' ? 'default' : 'outline'}
            onClick={() => setActiveSection('chat')}
            className="pixel-corners"
          >
            <Icon name="MessageSquare" size={16} className="mr-2" />
            Чат
          </Button>
          <Button
            variant={activeSection === 'search' ? 'default' : 'outline'}
            onClick={() => setActiveSection('search')}
            className="pixel-corners"
          >
            <Icon name="Search" size={16} className="mr-2" />
            Поиск
          </Button>
        </nav>

        {activeSection === 'about' && (
          <Card className="p-6 md:p-8 backdrop-blur-sm bg-card/80 animate-fade-in max-w-3xl mx-auto">
            <h2 className="text-2xl font-pixel mb-6 glow-text">О игре OneShot</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                OneShot - это приключенческая игра-головоломка, где вы играете за себя,
                помогая главному герою Нико вернуться домой.
              </p>
              <p>
                Особенность игры в том, что она взаимодействует с вашей операционной
                системой, создавая уникальный четвертой стены опыт.
              </p>
              <p>
                В игре вы несёте ответственность за судьбу целого мира, и ваш выбор
                действительно имеет значение.
              </p>
            </div>
          </Card>
        )}

        {activeSection === 'search' && (
          <Card className="p-6 backdrop-blur-sm bg-card/80 animate-fade-in max-w-3xl mx-auto">
            <h2 className="text-2xl font-pixel mb-6 glow-text">Поиск сообщений</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Введите текст для поиска..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-input/50"
              />
              <Button onClick={handleSearch} className="pixel-corners">
                <Icon name="Search" size={20} />
              </Button>
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-4">
                Найдено сообщений: {messages.length}
              </p>
            )}
          </Card>
        )}

        {activeSection === 'chat' && (
          <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
            <Card className="md:col-span-2 p-6 backdrop-blur-sm bg-card/80">
              <h2 className="text-xl font-pixel mb-4 glow-text flex items-center gap-2">
                <Icon name="MessageCircle" size={20} />
                Анонимный чат
              </h2>
              
              <ScrollArea className="h-[400px] mb-4 pr-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Пока нет сообщений. Будь первым!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-primary">
                            {msg.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.created_at).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{msg.message}</p>
                        {msg.image_url && (
                          <img
                            src={msg.image_url}
                            alt="Изображение"
                            className="mt-2 max-w-full rounded-lg max-h-64 object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>

            <Card className="p-6 backdrop-blur-sm bg-card/80">
              <h3 className="text-lg font-pixel mb-4 glow-text">Написать сообщение</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Имя</label>
                  <Input
                    placeholder="Аноним"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-input/50"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Сообщение</label>
                  <Textarea
                    placeholder="Ваше сообщение..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="bg-input/50 resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Ссылка на изображение (необязательно)
                  </label>
                  <Input
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="bg-input/50"
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="w-full pixel-corners"
                >
                  <Icon name="Send" size={16} className="mr-2" />
                  {isLoading ? 'Отправка...' : 'Отправить'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
