using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(SeChat.Startup))]
namespace SeChat
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}