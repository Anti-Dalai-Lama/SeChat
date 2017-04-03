using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SeChat.Models
{
    public static class Generator
    {
        public static long GenerateSimpleNumber()
        {
            int capacity = 100000;
            List<long> mass = new List<long>(capacity);
            for (int i = 0; i < capacity; i++)
            {
                mass.Add(i);
            }
            mass[1] = 0;
            int slide = 0;
            for (int k = 2; k < mass.Count; k++)
            {
                if (mass[k] != 0 && capacity > Math.Pow(mass[k], 2))
                {
                    for (long i = Convert.ToInt32(Math.Pow(mass[k], 2)) - slide; i < mass.Count; i += mass[k])
                    {
                        mass[(int)i] = 0;
                    }
                }
                else if (mass[k] == 0)
                {
                    mass.RemoveAt(k);
                    k--;
                    slide++;
                }
            }
            Random r = new Random();
            int index = r.Next();
            while(mass[index] < 1000)
            {
                index = r.Next();
            }
            return mass[index];
        }

    }
}