/**
darkemeralddd
**/
#define emerald "MEETING"
#pragma GCC optimize("O2")
#include <bits/stdc++.h>
#define l2 long long
#define ld long double
#define _ld (ld)
#define _l2 (l2)
#define st first
#define nd second
#define ll2 pair<l2,l2>
#define ii pair<int,int>
#define iii pair<int,ii>
#define il2 pair<int,l2>
#define l2i pair<l2,int>
#define memset(a,b) memset(a,b,sizeof(a))
#define ladd(a) a=" "+a
#define bit(x,y) (((y)>>(x))&1)
#define infinity() for(;;)
#define cntbit(x) __builtin_popcountll((x))
#define all(v) (v).begin(),(v).end()
#define __unique(v) (v).resize(distance((v).begin(),unique(all((v)))))
#define eb emplace_back
#define pb push_back
const l2 mod = 1000000007;
using namespace std;
int n,Q,dist[100005],personA,personB,root,anc[20][100005];
vector<int> ke[100005];
l2 a,b;
void dea(int v,int par=0) {
    for(auto u:ke[v]) {
        if(u!=par) {
            anc[0][u]=v;
            dist[u]=dist[v]+1;
            dea(u,v);
        }
    }
}
l2 d[1005][2];
queue<ii> q;
void bfs(int v,bool id) {
    for(int i=1; i<=n; i++) {
        d[i][id]=-1;
    }

    d[v][id]=0;
    q.push({v,1});
    while(q.size()) {
        int fr=q.front().st;
        int dfr=q.front().nd;

        q.pop();

        for(auto i:ke[fr]) {
            if(d[i][id]==-1) {
//                cout<<fr<<"->"<<i<<" ";
                d[i][id]=d[fr][id]+1ll*(dist[fr]>dist[i]?a:b)*dfr;
//                cout<<d[i][id]<<endl;
                q.push({i,dfr+1});
            }
        }
    }
}
void s1() {
    while(Q--) {
        cin>>root>>personA>>personB>>a>>b;
        dist[root]=0;
        dea(root);
        bfs(personA,0);
//        cout<<endl;
        bfs(personB,1);

        l2 mn=1e18;

        for(int i=1; i<=n; i++) {
//            cout<<
            mn=min(mn,d[i][0]+d[i][1]);
        }

        cout<<mn<<'\n';
    }
}
int lcaOrigin(int x,int y) {
    if(dist[x]<dist[y]) swap(x,y);

    for(int k=17; k>=0; k--)
        if(dist[x]-(1<<k)>=dist[y])
            x=anc[k][x];

    if(x==y) return x;

    for(int k=17; k>=0; k--)
        if(anc[k][x]!=0&&anc[k][x]!=anc[k][y]) {
            x=anc[k][x];
            y=anc[k][y];
        }

    while(x!=y) {
        x=anc[0][x];
        y=anc[0][y];
    }

    return x;
}
int lca(int x,int y) {
    int l=lcaOrigin(x,y),xr=lcaOrigin(x,root),yr=lcaOrigin(y,root);
    if(xr==yr) return l;
    if(yr==l) return xr;
    return yr;
}
int minDist(int x,int y) {
    int l=lcaOrigin(x,y);
    return dist[x]+dist[y]-2*dist[l];
}
l2 attemp(l2 I,l2 &A,l2 &B,l2 &C) {
    return A*I*I+B*I+C;
}
l2 solve() {
    int l=lca(personA,personB);
    int c=minDist(personA,l),d=minDist(personB,l);
    l2 A=a+b,B=a-b*d-2*c*b-d*b-b,C=b*d*(2*c+d+1)+a*(c+1)*c;

//    cout<<personA<<" "<<personB<<" "<<l<<endl;
//    cout<<a<<" "<<b<<" "<<c<<" "<<d<<" "<<A<<" "<<B<<" "<<C<<endl;

    l2 X1=floor(-B/(2.0*A)),X2=ceil(-B/(2.0*A));

//    cout<<X1<<" "<<X2<<endl;

    l2 tmp=min(attemp(0,A,B,C),attemp(d,A,B,C));

//    cout<<tmp<<endl;

    if(0<=X1&&X1<=d) tmp=min(tmp,attemp(X1,A,B,C));
    if(0<=X2&&X2<=d) tmp=min(tmp,attemp(X2,A,B,C));

//    cout<<tmp<<endl;

    return tmp;
}
void s234() {
    dist[1]=0;
    dea(1);

    for(int k=1; k<=17; k++)
        for(int i=1; i<=n; i++)
            anc[k][i]=anc[k-1][anc[k-1][i]];

    while(Q--) {
        cin>>root>>personA>>personB>>a>>b;

        if(b>=n*a) {
            int l=lca(personA,personB);
            l2 A=minDist(personA,l),B=minDist(personB,l);
            cout<<a*(A*(A+1)/2+B*(B+1)/2)<<'\n';
            continue;
        }

        l2 mn=solve();
        swap(personA,personB);
        mn=min(mn,solve());

        cout<<(mn>>1)<<'\n';
    }
}
int main() {
    ios::sync_with_stdio(0);
    cin.tie(0); cout.tie(0);

    freopen(emerald".INP","r",stdin);
    freopen(emerald".OUT","w",stdout);

    cin>>n>>Q;
    for(int i=1,x,y; i<n; i++) {
        cin>>x>>y;
        ke[x].pb(y);
        ke[y].pb(x);
    }

//    s234();

    if(n<=1000&&Q<=1000) s1();
    else s234();
}


