using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SeChat.Models
{
    public static class Chat
    {
        public static string user;

        public static int p = 0;
        public static int g = 0;

        public static int openKey1 = 0;
        public static int openKey2 = 0;

        public static bool keyRSA1 = false;
        public static KeysRSA key1 = new KeysRSA(0, 0);

        public static bool keyRSA2 = false;
        public static KeysRSA key2 = new KeysRSA(0, 0);

        public static List<SignedMessage> messages1 = new List<SignedMessage>();//сообщения первого юзера
        public static List<SignedMessage> messages2 = new List<SignedMessage>();//сообщения второго юзера
    }

    public class KeysRSA
    {
        public int E;
        public int N;

        public KeysRSA(int e, int n)
        {
            E = e;
            N = n;
        }
    }

    public class Message
    {
        public int id;
        public string mes;

        public Message(int i, string m)
        {
            id = i;
            mes = m;
        }
    }

    public class SignedMessage : Message
    {
        public int sign;

        public SignedMessage(int i, string m, int s): base(i, m)
        {
            sign = s;
        }
    }
}