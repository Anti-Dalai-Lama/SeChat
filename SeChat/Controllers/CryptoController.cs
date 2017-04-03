using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Timers;
using SeChat.Models;
using System.Web.Script.Serialization;

namespace SeChat.Controllers
{
    public class CryptoController : Controller
    {
        public string FormPG(int p, int g, int e, int n)
        {
            if(Chat.p == 0 && Chat.g == 0)
            {
                Chat.p = p;
                Chat.g = g;
                Chat.keyRSA1 = true;
                Chat.key1 = new KeysRSA(e, n);
                return "done";
            }
            else
            {
                Chat.keyRSA2 = true;
                Chat.key2 = new KeysRSA(e, n);
                return Chat.p.ToString() + " " + Chat.g.ToString();
            }
        }

        public string SetOpenKey(int openkey)
        {
            if(Chat.openKey1 == 0)
            {
                Chat.openKey1 = openkey;
                return WaitForKey();
            }
            else if (Chat.openKey2 == 0)
            {
                Chat.openKey2 = openkey;
                return Chat.openKey1 + " " + Chat.key1.E + " " + Chat.key1.N;
            }
            ClearServer();
            return "none";
        }

        public static string WaitForKey()
        {
            try
            {
                Timer t = new Timer(100);
                t.AutoReset = false;
                while (Chat.openKey2 == 0)
                {
                    t.Start();
                }
                return Chat.openKey2 + " " + Chat.key2.E + " " + Chat.key2.N;
            }
            catch(Exception e)
            {
                ClearServer();
                return "none";
            }
        }

        public static void ClearServer()
        {
            Chat.p = 0;
            Chat.g = 0;
            Chat.openKey1 = 0;
            Chat.openKey2 = 0;
            Chat.keyRSA1 = false;
            Chat.keyRSA2 = false;
            Chat.key2 = new KeysRSA(0, 0);
            Chat.key2 = new KeysRSA(0, 0);
            Chat.messages1 = new List<SignedMessage>();
            Chat.messages2 = new List<SignedMessage>();
        }

        public string SendMessage(int id, string mes, int sign)
        {
            if (id == 1)
            {
                Chat.messages1.Add(new SignedMessage(id, mes, sign));
                return "done";
            }
            else if(id == 2)
            {
                Chat.messages2.Add(new SignedMessage(id, mes, sign));
                return "done";
            }
            return "none";
        }

        public string GetMessage(int id)
        {
            if(id == 1)
            {
                return new JavaScriptSerializer().Serialize(Chat.messages2);
            }
            else if(id == 2)
            {
                return new JavaScriptSerializer().Serialize(Chat.messages1);
            }
            else
            {
                return "none";
            }
        }

    }
}